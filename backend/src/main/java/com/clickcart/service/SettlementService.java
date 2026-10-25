package com.clickcart.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.clickcart.dto.SettlementCreateRequest;
import com.clickcart.dto.SettlementPageResponse;
import com.clickcart.dto.SettlementPageResponse.CycleStep;
import com.clickcart.dto.SettlementPageResponse.CycleTracker;
import com.clickcart.dto.SettlementPageResponse.FinanceAuthStates;
import com.clickcart.dto.SettlementPageResponse.SettlementRow;
import com.clickcart.dto.SettlementPageResponse.SummaryStats;
import com.clickcart.exception.BadRequestException;
import com.clickcart.model.Settlement;
import com.clickcart.repository.SettlementRepository;

/**
 * Reads settlement data entirely from MongoDB Atlas.
 * All summary stats, auth-state counts and table rows come from the database.
 */
@Service
public class SettlementService {



    private final SettlementRepository settlementRepo;
    @org.springframework.beans.factory.annotation.Autowired
    private com.clickcart.repository.ProviderPayoutLedgerRepository payouts;
    private void syncPayoutRequests() {
        if (payouts == null) return;
        String providerId = com.clickcart.security.CurrentProvider.id();
        payouts.findById(providerId).ifPresent(ledger -> ledger.requests.forEach(request -> {

            Settlement row = new Settlement(); row.setId(request.id()); row.setProviderId(providerId);
            row.setMerchantRecipient(request.bankName()); row.setAmount(request.amount()); row.setNetAmount(request.amount()); row.setFee(BigDecimal.ZERO);
            row.setCaptureDate(request.createdAt().atZone(java.time.ZoneOffset.UTC).toLocalDate()); row.setPayoutMethod("Bank Transfer"); row.setFinanceState("SETTLED".equals(request.status()) ? "Settled" : "REJECTED".equals(request.status()) ? "Disputed" : "On Hold");
            settlementRepo.save(row);
        }));
    }

    public SettlementService(SettlementRepository settlementRepo) {
        this.settlementRepo = settlementRepo;
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Public API
     * ───────────────────────────────────────────────────────────────────── */
    public SettlementPageResponse getSettlements(int page, int pageSize,
                                                  String search, String dateFilter,
                                                  String stateFilter) {

        syncPayoutRequests();
        // BE-048: normalise page=0 (or any negative value) to page=1
        int safePage = Math.max(1, page);

        Pageable pageable = PageRequest.of(safePage - 1, pageSize);
        String q = (search == null) ? "" : search.trim();
        boolean hasState  = stateFilter != null && !stateFilter.isBlank()
                && !"All Finance States".equalsIgnoreCase(stateFilter);
        boolean hasSearch = !q.isEmpty();

        // ── 1. Paginated settlement rows ───────────────────────────────────
        Page<Settlement> dbPage;
        if (hasState && hasSearch) {
            dbPage = settlementRepo.searchByProviderStateAndQuery(com.clickcart.security.CurrentProvider.id(), stateFilter, q, pageable);
        } else if (hasState) {
            dbPage = settlementRepo.findByProviderIdAndFinanceStateOrderByCaptureDateDescIdDesc(
                    com.clickcart.security.CurrentProvider.id(), stateFilter, pageable);
        } else if (hasSearch) {
            dbPage = settlementRepo.searchByProviderAndQuery(com.clickcart.security.CurrentProvider.id(), q, pageable);
        } else {
            dbPage = settlementRepo.findByProviderIdOrderByCaptureDateDescIdDesc(com.clickcart.security.CurrentProvider.id(), pageable);
        }

        List<SettlementRow> rows = dbPage.getContent().stream()
                .map(this::toRow)
                .toList();

        // ── 2. Summary stats (always across full provider dataset) ─────────
        SummaryStats summary = buildSummary();

        // ── 3. Finance auth state counts ───────────────────────────────────
        FinanceAuthStates authStates = buildAuthStates();

        // ── 4. Cycle tracker (time-driven, no DB) ─────────────────────────
        CycleTracker cycle = buildCycleTracker();

        // ── 5. Assemble response ───────────────────────────────────────────
        SettlementPageResponse resp = new SettlementPageResponse();
        resp.setSummary(summary);
        resp.setFinanceAuthStates(authStates);
        resp.setCycleTracker(cycle);
        resp.setSettlements(rows);
        resp.setTotal((int) dbPage.getTotalElements());
        resp.setPage(safePage);
        resp.setPageSize(pageSize);
        return resp;
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Create a new settlement (POST)
     * ───────────────────────────────────────────────────────────────────── */
    public SettlementRow createSettlement(SettlementCreateRequest req) {
        // Auto-generate next sequential ID like #SET-4663
        String nextId = generateNextId();

        BigDecimal amount = BigDecimal.valueOf(req.getAmount()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fee    = amount.multiply(new BigDecimal("0.02")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net    = amount.subtract(fee);

        // BE-047: validate date strings before parsing to avoid 500 on bad input
        LocalDate captureDate;
        LocalDate settlementDate;
        try {
            captureDate = LocalDate.parse(req.getCaptureDate());
        } catch (DateTimeParseException e) {
            throw new BadRequestException(
                    "Invalid captureDate '" + req.getCaptureDate()
                    + "'. Expected ISO format yyyy-MM-dd.");
        }
        try {
            settlementDate = LocalDate.parse(req.getSettlementDate());
        } catch (DateTimeParseException e) {
            throw new BadRequestException(
                    "Invalid settlementDate '" + req.getSettlementDate()
                    + "'. Expected ISO format yyyy-MM-dd.");
        }

        Settlement s = new Settlement();
        s.setId(nextId);
        s.setProviderId(com.clickcart.security.CurrentProvider.id());
        s.setMerchantRecipient(req.getMerchantRecipient());
        s.setAmount(amount);
        s.setFee(fee);
        s.setNetAmount(net);
        s.setCaptureDate(captureDate);
        s.setSettlementDate(settlementDate);
        s.setPayoutMethod(req.getPayoutMethod());
        s.setFinanceState(req.getFinanceState());

        settlementRepo.save(s);
        return toRow(s);
    }

    /** Finds the highest existing #SET-XXXX number and returns the next one. */
    private String generateNextId() {
        List<Settlement> all = settlementRepo.findByProviderIdAndFinanceStateIn(
                com.clickcart.security.CurrentProvider.id(),
                List.of("Authorized","Captured","Settled","Released","On Hold","Disputed"));

        int maxNum = all.stream()
                .map(Settlement::getId)
                .filter(id -> id != null && id.startsWith("#SET-"))
                .map(id -> {
                    try { return Integer.parseInt(id.replace("#SET-", "")); }
                    catch (NumberFormatException e) { return 0; }
                })
                .max(Comparator.naturalOrder())
                .orElse(4490);

        return "#SET-" + (maxNum + 1);
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Summary stats – sums from all settlements in DB for this provider
     * ───────────────────────────────────────────────────────────────────── */
    private SummaryStats buildSummary() {
        List<Settlement> all = settlementRepo.findByProviderIdAndFinanceStateIn(
                com.clickcart.security.CurrentProvider.id(),
                List.of("Authorized","Captured","Settled","Released","On Hold","Disputed"));

        SummaryStats s = new SummaryStats();
        s.setTotalSettlementsCount(all.size());
        s.setTotalSettlementsAmount(sumNet(all));

        List<Settlement> pending = all.stream()
                .filter(r -> "Authorized".equals(r.getFinanceState())
                          || "Captured".equals(r.getFinanceState())
                          || "On Hold".equals(r.getFinanceState()))
                .toList();
        s.setPendingPayoutsCount(pending.size());
        s.setPendingPayoutsAmount(sumNet(pending));

        List<Settlement> completed = all.stream()
                .filter(r -> "Settled".equals(r.getFinanceState())
                          || "Released".equals(r.getFinanceState()))
                .toList();
        s.setCompletedPayoutsCount(completed.size());
        s.setCompletedPayoutsAmount(sumNet(completed));

        List<Settlement> failed = all.stream()
                .filter(r -> "Disputed".equals(r.getFinanceState()))
                .toList();
        s.setFailedPayoutsCount(failed.size());
        s.setFailedPayoutsAmount(sumNet(failed));

        return s;
    }

    private double sumNet(List<Settlement> rows) {
        return rows.stream()
                .map(Settlement::getNetAmount)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Finance authorization state counts – queried directly from MongoDB
     * ───────────────────────────────────────────────────────────────────── */
    private FinanceAuthStates buildAuthStates() {
        FinanceAuthStates f = new FinanceAuthStates();
        f.setAuthorized((int) settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), "Authorized"));
        f.setCaptured  ((int) settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), "Captured"));
        f.setSettled   ((int) settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), "Settled"));
        f.setReleased  ((int) settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), "Released"));
        f.setOnHold    ((int) settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), "On Hold"));
        f.setDisputed  ((int) settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), "Disputed"));
        return f;
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Settlement cycle tracker – driven by wall-clock time (T+0..T+3)
     * ───────────────────────────────────────────────────────────────────── */
    private CycleTracker buildCycleTracker() {
        CycleTracker tracker = new CycleTracker();
        String[] states = {"Authorized", "Captured", "Settled", "Released"};
        List<CycleStep> steps = new ArrayList<>();
        long total = 0, released = 0;
        for (String state : states) {
            long count = settlementRepo.countByProviderIdAndFinanceState(com.clickcart.security.CurrentProvider.id(), state);
            total += count;
            if ("Released".equals(state)) released = count;
            steps.add(new CycleStep(state, count > 0 ? "completed" : "pending", count + " records"));
        }
        tracker.setSteps(steps);
        tracker.setCurrentStage(total == 0 ? "No settlements yet" : "Recorded settlement states");
        tracker.setProgressPercent(total == 0 ? 0 : (int) (released * 100 / total));
        return tracker;
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Mapping helper
     * ───────────────────────────────────────────────────────────────────── */
    private SettlementRow toRow(Settlement s) {
        return new SettlementRow(
                s.getId(),
                s.getMerchantRecipient(),
                s.getAmount()     != null ? s.getAmount().doubleValue()     : 0,
                s.getFee()        != null ? s.getFee().doubleValue()        : 0,
                s.getNetAmount()  != null ? s.getNetAmount().doubleValue()  : 0,
                s.getCaptureDate()    != null ? formatDate(s.getCaptureDate())    : "",
                s.getSettlementDate() != null ? formatDate(s.getSettlementDate()) : "",
                s.getPayoutMethod(),
                s.getFinanceState()
        );
    }

    private static final java.time.format.DateTimeFormatter DATE_FMT =
            java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy");

    private String formatDate(java.time.LocalDate d) {
        return d.format(DATE_FMT);
    }
}
