package com.clickcart.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
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
import com.clickcart.model.Settlement;
import com.clickcart.repository.SettlementRepository;

/**
 * Reads settlement data entirely from MongoDB Atlas.
 * All summary stats, auth-state counts and table rows come from the database.
 */
@Service
public class SettlementService {

    private static final String DEFAULT_PROVIDER_ID = "PROV-1002";

    private final SettlementRepository settlementRepo;

    public SettlementService(SettlementRepository settlementRepo) {
        this.settlementRepo = settlementRepo;
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Public API
     * ───────────────────────────────────────────────────────────────────── */
    public SettlementPageResponse getSettlements(int page, int pageSize,
                                                  String search, String dateFilter,
                                                  String stateFilter) {

        Pageable pageable = PageRequest.of(page - 1, pageSize);
        String q = (search == null) ? "" : search.trim();
        boolean hasState  = stateFilter != null && !stateFilter.isBlank()
                && !"All Finance States".equalsIgnoreCase(stateFilter);
        boolean hasSearch = !q.isEmpty();

        // ── 1. Paginated settlement rows ───────────────────────────────────
        Page<Settlement> dbPage;
        if (hasState && hasSearch) {
            dbPage = settlementRepo.searchByProviderStateAndQuery(DEFAULT_PROVIDER_ID, stateFilter, q, pageable);
        } else if (hasState) {
            dbPage = settlementRepo.findByProviderIdAndFinanceStateOrderByCaptureDateDescIdDesc(
                    DEFAULT_PROVIDER_ID, stateFilter, pageable);
        } else if (hasSearch) {
            dbPage = settlementRepo.searchByProviderAndQuery(DEFAULT_PROVIDER_ID, q, pageable);
        } else {
            dbPage = settlementRepo.findByProviderIdOrderByCaptureDateDescIdDesc(DEFAULT_PROVIDER_ID, pageable);
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
        resp.setPage(page);
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

        Settlement s = new Settlement();
        s.setId(nextId);
        s.setProviderId(DEFAULT_PROVIDER_ID);
        s.setMerchantRecipient(req.getMerchantRecipient());
        s.setAmount(amount);
        s.setFee(fee);
        s.setNetAmount(net);
        s.setCaptureDate(LocalDate.parse(req.getCaptureDate()));
        s.setSettlementDate(LocalDate.parse(req.getSettlementDate()));
        s.setPayoutMethod(req.getPayoutMethod());
        s.setFinanceState(req.getFinanceState());

        settlementRepo.save(s);
        return toRow(s);
    }

    /** Finds the highest existing #SET-XXXX number and returns the next one. */
    private String generateNextId() {
        List<Settlement> all = settlementRepo.findByProviderIdAndFinanceStateIn(
                DEFAULT_PROVIDER_ID,
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
                DEFAULT_PROVIDER_ID,
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
        f.setAuthorized((int) settlementRepo.countByProviderIdAndFinanceState(DEFAULT_PROVIDER_ID, "Authorized"));
        f.setCaptured  ((int) settlementRepo.countByProviderIdAndFinanceState(DEFAULT_PROVIDER_ID, "Captured"));
        f.setSettled   ((int) settlementRepo.countByProviderIdAndFinanceState(DEFAULT_PROVIDER_ID, "Settled"));
        f.setReleased  ((int) settlementRepo.countByProviderIdAndFinanceState(DEFAULT_PROVIDER_ID, "Released"));
        f.setOnHold    ((int) settlementRepo.countByProviderIdAndFinanceState(DEFAULT_PROVIDER_ID, "On Hold"));
        f.setDisputed  ((int) settlementRepo.countByProviderIdAndFinanceState(DEFAULT_PROVIDER_ID, "Disputed"));
        return f;
    }

    /* ─────────────────────────────────────────────────────────────────────
     * Settlement cycle tracker – driven by wall-clock time (T+0..T+3)
     * ───────────────────────────────────────────────────────────────────── */
    private CycleTracker buildCycleTracker() {
        LocalTime now  = LocalTime.now();
        int hour       = now.getHour();
        int minute     = now.getMinute();

        CycleTracker ct = new CycleTracker();
        List<CycleStep> steps = new ArrayList<>();
        steps.add(new CycleStep("T+0 · Authorized", "completed", "Completed (12:00 AM)"));
        steps.add(new CycleStep("T+1 · Captured",   "completed", "Completed (04:00 AM)"));

        if (hour < 12) {
            // T+2 in progress, T+3 pending
            String hhmm = String.format("%02d:%02d %s",
                    hour % 12 == 0 ? 12 : hour % 12,
                    minute,
                    hour < 12 ? "AM" : "PM");
            steps.add(new CycleStep("T+2 · Settled",  "in-progress", "In Progress (" + hhmm + ")"));
            steps.add(new CycleStep("T+3 · Released",  "pending",     "Estimated (12:00 PM)"));
            ct.setCurrentStage("T+2");
            int minutesPast8 = Math.max(0, (hour - 8) * 60 + minute);
            int totalMinutes = 4 * 60; // 08:00 → 12:00
            ct.setProgressPercent(Math.min(99, 50 + (int)(minutesPast8 * 50.0 / totalMinutes)));
            long minsLeft = ((12L - hour) * 60) - minute;
            ct.setCycleFinishesIn(minsLeft + "m");
        } else if (hour < 18) {
            // T+3 in progress
            steps.add(new CycleStep("T+2 · Settled",  "completed",   "Completed (12:00 PM)"));
            steps.add(new CycleStep("T+3 · Released",  "in-progress", "In Progress"));
            ct.setCurrentStage("T+3");
            ct.setProgressPercent(80 + (hour - 12) * 2);
            long minsLeft = ((18L - hour) * 60) - minute;
            ct.setCycleFinishesIn(minsLeft / 60 + "h " + minsLeft % 60 + "m");
        } else {
            // Cycle complete
            steps.add(new CycleStep("T+2 · Settled",  "completed", "Completed (12:00 PM)"));
            steps.add(new CycleStep("T+3 · Released",  "completed", "Completed (06:00 PM)"));
            ct.setCurrentStage("T+3");
            ct.setProgressPercent(100);
            ct.setCycleFinishesIn("Completed");
        }

        ct.setSteps(steps);
        return ct;
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
