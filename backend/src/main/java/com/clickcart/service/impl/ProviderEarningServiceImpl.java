package com.clickcart.service.impl;

import com.clickcart.dto.*;
import com.clickcart.exception.BadRequestException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.EarningStatus;
import com.clickcart.model.ProviderEarning;
import com.clickcart.repository.ProviderEarningRepository;
import com.clickcart.service.ProviderEarningService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProviderEarningServiceImpl implements ProviderEarningService {

    private static final Logger log = LoggerFactory.getLogger(ProviderEarningServiceImpl.class);

    private final ProviderEarningRepository earningRepository;
    @org.springframework.beans.factory.annotation.Autowired
    private com.clickcart.repository.ProviderPayoutLedgerRepository payouts;
    @org.springframework.beans.factory.annotation.Autowired
    private com.clickcart.repository.CommissionTransactionRepository commissionTransactions;

    @Override public List<ProviderEarning> getRecordedEarnings(String providerId) { return earningsFor(providerId); }

    private List<ProviderEarning> earningsFor(String providerId) {
        // Combine persisted commission snapshots with legacy earnings without duplicating ledger entries.
        Map<String, ProviderEarning> combined = new LinkedHashMap<>();
        earningRepository.findByProviderId(providerId).forEach(earning -> combined.put(earning.getTransactionId(), earning));
        if (commissionTransactions != null) {
            for (var tx : commissionTransactions.findByProvider(providerId)) {
                if (!providerId.equals(tx.provider())) continue;
                ProviderEarning earning = combined.getOrDefault(tx.transactionId(), new ProviderEarning());
                if (earning.getId() == null) earning.setId("commission-" + tx.transactionId());
                earning.setProviderId(providerId); earning.setTransactionId(tx.transactionId()); earning.setBookingId(tx.transactionId());
                earning.setServiceTitle(tx.service()); earning.setCategory(tx.category()); earning.setCustomerName(tx.customer());
                earning.setGrossAmount(tx.bookingAmount()); earning.setCommissionAmount(tx.commissionAmount()); earning.setNetAmount(tx.providerEarning());
                earning.setCommissionRate(tx.bookingAmount().signum() == 0 ? BigDecimal.ZERO : tx.commissionAmount().divide(tx.bookingAmount(), 6, RoundingMode.HALF_UP));
                earning.setStatus(tx.status() == com.clickcart.model.CommissionTransaction.TransactionStatus.SETTLED ? EarningStatus.AVAILABLE : EarningStatus.PENDING);
                earning.setCreatedAt(tx.date()); earning.setServiceCompletedAt(tx.date()); combined.put(tx.transactionId(), earning);
            }
        }
        return new ArrayList<>(combined.values());
    }


    public ProviderEarningServiceImpl(ProviderEarningRepository earningRepository) {
        this.earningRepository = earningRepository;
    }

    private static final Set<String> SUPPORTED_PERIODS = Set.of(
            "7days", "7d", "week",
            "30days", "30d", "month",
            "90days", "90d", "quarter",
            "365days", "1year", "1y", "year",
            "all"
    );

    @Override
    public EarningsSummaryResponse getEarningsSummary(String providerId, String period) {
        String normPeriod = (period == null || period.isBlank()) ? "30days" : period.trim().toLowerCase();
        if (!SUPPORTED_PERIODS.contains(normPeriod)) {
            throw new BadRequestException("Unsupported earnings period: '" + period + "'. Supported periods are: 7days, 30days, 90days, 365days, all.");
        }


        List<ProviderEarning> earnings = earningsFor(providerId);

        Instant cutoff = null;
        if (normPeriod.equals("7days") || normPeriod.equals("7d") || normPeriod.equals("week")) {
            cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        } else if (normPeriod.equals("30days") || normPeriod.equals("30d") || normPeriod.equals("month")) {
            cutoff = Instant.now().minus(30, ChronoUnit.DAYS);
        } else if (normPeriod.equals("90days") || normPeriod.equals("90d") || normPeriod.equals("quarter")) {
            cutoff = Instant.now().minus(90, ChronoUnit.DAYS);
        } else if (normPeriod.equals("365days") || normPeriod.equals("1year") || normPeriod.equals("1y") || normPeriod.equals("year")) {
            cutoff = Instant.now().minus(365, ChronoUnit.DAYS);
        }

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal netAvailable = BigDecimal.ZERO;
        BigDecimal pendingClearance = BigDecimal.ZERO;
        long pendingCount = 0;

        for (ProviderEarning earning : earnings) {
            Instant created = earning.getCreatedAt() != null ? earning.getCreatedAt()
                    : (earning.getServiceCompletedAt() != null ? earning.getServiceCompletedAt() : Instant.EPOCH);

            BigDecimal gross = earning.getGrossAmount() != null ? earning.getGrossAmount() : BigDecimal.ZERO;
            BigDecimal comm = earning.getCommissionAmount() != null ? earning.getCommissionAmount() : BigDecimal.ZERO;
            BigDecimal net = earning.getNetAmount() != null ? earning.getNetAmount() : BigDecimal.ZERO;

            if (cutoff == null || !created.isBefore(cutoff)) {
                if (earning.getStatus() != EarningStatus.REFUNDED) {
                    totalGross = totalGross.add(gross);
                    totalCommission = totalCommission.add(comm);
                }
            }

            if (earning.getStatus() == EarningStatus.AVAILABLE) {
                netAvailable = netAvailable.add(net);
            } else if (earning.getStatus() == EarningStatus.PENDING) {
                pendingClearance = pendingClearance.add(net);
                pendingCount++;
            }
        }

        if (payouts != null) netAvailable = netAvailable.subtract(payouts.findById(providerId).map(com.clickcart.model.ProviderPayoutLedger::reserved).orElse(BigDecimal.ZERO)).max(BigDecimal.ZERO);
        Double growthPct = 0.0;

        return new EarningsSummaryResponse(
                totalGross.setScale(2, RoundingMode.HALF_UP),
                totalCommission.setScale(2, RoundingMode.HALF_UP),
                netAvailable.setScale(2, RoundingMode.HALF_UP),
                pendingClearance.setScale(2, RoundingMode.HALF_UP),
                growthPct,
                pendingCount,
                "LKR"
        );
    }

    @Override
    public List<MonthlyTrendDto> getMonthlyTrends(String providerId) {

        var earnings = earningsFor(providerId);
        var now = java.time.YearMonth.now(java.time.ZoneOffset.UTC);
        List<MonthlyTrendDto> trends = new ArrayList<>();
        for (int offset = 5; offset >= 0; offset--) {
            var month = now.minusMonths(offset);
            BigDecimal gross = BigDecimal.ZERO, net = BigDecimal.ZERO, commission = BigDecimal.ZERO;
            for (var earning : earnings) {
                if (earning.getCreatedAt() == null || earning.getStatus() == EarningStatus.REFUNDED || !java.time.YearMonth.from(earning.getCreatedAt().atZone(java.time.ZoneOffset.UTC)).equals(month)) continue;
                gross = gross.add(Optional.ofNullable(earning.getGrossAmount()).orElse(BigDecimal.ZERO));
                net = net.add(Optional.ofNullable(earning.getNetAmount()).orElse(BigDecimal.ZERO));
                commission = commission.add(Optional.ofNullable(earning.getCommissionAmount()).orElse(BigDecimal.ZERO));
            }
            trends.add(new MonthlyTrendDto(month.toString(), gross, net, commission));
        }
        return trends;
    }

    @Override
    public List<CategoryBreakdownDto> getCategoryBreakdown(String providerId) {

        List<ProviderEarning> earnings = earningsFor(providerId);

        Map<String, BigDecimal> categorySums = new HashMap<>();
        BigDecimal total = BigDecimal.ZERO;

        for (ProviderEarning earning : earnings) {
            if (earning.getStatus() == EarningStatus.REFUNDED) continue;
            String cat = earning.getCategory() != null ? earning.getCategory() : "General";
            BigDecimal net = earning.getNetAmount() != null ? earning.getNetAmount() : BigDecimal.ZERO;
            categorySums.merge(cat, net, BigDecimal::add);
            total = total.add(net);
        }

        if (total.signum() == 0) return List.of();

        final BigDecimal grandTotal = total;
        return categorySums.entrySet().stream()
                .map(e -> {
                    double pct = e.getValue()
                            .divide(grandTotal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                    return new CategoryBreakdownDto(e.getKey(), e.getValue().setScale(2, RoundingMode.HALF_UP), pct);
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProviderTransactionDto> getTransactions(String providerId, String search, String status,
                                                       Instant startDate, Instant endDate, Pageable pageable) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("Invalid date range: endDate cannot be earlier than startDate");
        }


        List<ProviderEarning> allEarnings = earningsFor(providerId);

        // In-memory filter stream for flexible multi-condition criteria
        List<ProviderEarning> filtered = allEarnings.stream()
                .filter(e -> {
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                        try {
                            EarningStatus requiredStatus = EarningStatus.valueOf(status.toUpperCase());
                            if (e.getStatus() != requiredStatus) return false;
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        boolean matchId = e.getTransactionId() != null && e.getTransactionId().toLowerCase().contains(s);
                        boolean matchBooking = e.getBookingId() != null && e.getBookingId().toLowerCase().contains(s);
                        boolean matchService = e.getServiceTitle() != null && e.getServiceTitle().toLowerCase().contains(s);
                        boolean matchCustomer = e.getCustomerName() != null && e.getCustomerName().toLowerCase().contains(s);
                        if (!matchId && !matchBooking && !matchService && !matchCustomer) return false;
                    }
                    Instant created = e.getCreatedAt() != null ? e.getCreatedAt()
                            : (e.getServiceCompletedAt() != null ? e.getServiceCompletedAt() : Instant.EPOCH);
                    if (startDate != null && created.isBefore(startDate)) return false;
                    if (endDate != null && created.isAfter(endDate)) return false;
                    return true;
                })
                .sorted((a, b) -> {
                    Instant aTime = a.getCreatedAt() != null ? a.getCreatedAt()
                            : (a.getServiceCompletedAt() != null ? a.getServiceCompletedAt() : Instant.EPOCH);
                    Instant bTime = b.getCreatedAt() != null ? b.getCreatedAt()
                            : (b.getServiceCompletedAt() != null ? b.getServiceCompletedAt() : Instant.EPOCH);
                    return bTime.compareTo(aTime);
                })
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());

        List<ProviderTransactionDto> pageContent = (start <= end)
                ? filtered.subList(start, end).stream().map(ProviderTransactionDto::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    @Override
    public ProviderTransactionDto getTransactionById(String providerId, String transactionId) {
        var projected = earningsFor(providerId).stream().filter(e -> transactionId.equals(e.getTransactionId()) || transactionId.equals(e.getId())).findFirst();
        ProviderEarning earning = projected.or(() -> earningRepository.findByTransactionId(transactionId))
                .or(() -> earningRepository.findByIdAndProviderId(transactionId, providerId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        if (!earning.getProviderId().equals(providerId)) {
            throw new ForbiddenException("Access denied: You cannot view transaction data for another provider (BR-09)");
        }

        return ProviderTransactionDto.fromEntity(earning);
    }

    @Override
    public ProviderTransactionDto recordEarning(CreateEarningRequest request) {
        log.info("Recording new provider earning for booking: {}", request.getBookingId());

        BigDecimal gross = request.getGrossAmount();
        BigDecimal rate = request.getCommissionRate() != null ? request.getCommissionRate() : new BigDecimal("0.10");

        // Enforce BR-07: Snapshot calculation
        BigDecimal commission = gross.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(commission).setScale(2, RoundingMode.HALF_UP);

        String txnId = request.getTransactionId() != null && !request.getTransactionId().isBlank()
                ? request.getTransactionId()
                : "TXN-" + System.currentTimeMillis();

        ProviderEarning earning = new ProviderEarning(
                request.getProviderId(),
                request.getBookingId(),
                txnId,
                request.getServiceTitle(),
                request.getCategory() != null ? request.getCategory() : "General",
                request.getCustomerName() != null ? request.getCustomerName() : "Customer",
                gross,
                rate,
                commission,
                net,
                request.getCurrency() != null ? request.getCurrency() : "LKR",
                EarningStatus.AVAILABLE,
                Instant.now()
        );

        ProviderEarning saved = earningRepository.save(earning);
        return ProviderTransactionDto.fromEntity(saved);
    }

    @Override
    public PayoutResponse requestPayout(String providerId, PayoutRequest request) {
        log.info("Processing payout request of LKR {} for provider {}", request.getAmount(), providerId);

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payout amount must be greater than zero");
        }

        EarningsSummaryResponse summary = getEarningsSummary(providerId, "ALL");
        if (request.getAmount().compareTo(summary.getNetAvailableBalance()) > 0) {
            throw new BadRequestException("Requested amount exceeds net available balance of LKR " + summary.getNetAvailableBalance());
        }

        if (request.getAccountNumber() == null || request.getAccountNumber().isBlank() || request.getBankName() == null || request.getBankName().isBlank()) throw new BadRequestException("Bank name and account number are required");
        var ledger = payouts.findById(providerId).orElseGet(com.clickcart.model.ProviderPayoutLedger::new);
        ledger.providerId = providerId;
        // Recheck using the same ledger version that will be atomically saved.
        BigDecimal cleared = earningsFor(providerId).stream().filter(e -> e.getStatus() == EarningStatus.AVAILABLE).map(ProviderEarning::getNetAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (request.getAmount().compareTo(cleared.subtract(ledger.reserved())) > 0) throw new BadRequestException("Requested amount exceeds the available balance");
        String payoutId = "PO-" + UUID.randomUUID();
        Instant requestedAt = Instant.now();
        ledger.requests.add(new com.clickcart.model.ProviderPayoutLedger.Request(payoutId, request.getAmount(), request.getBankName(), request.getAccountNumber(), request.getBranch(), "REQUESTED", requestedAt));
        try { payouts.save(ledger); }
        catch (org.springframework.dao.OptimisticLockingFailureException | org.springframework.dao.DuplicateKeyException ex) { throw new BadRequestException("Your balance changed. Refresh and try again."); }
        String raw = request.getAccountNumber();
        return new PayoutResponse(payoutId, providerId, request.getAmount(), "LKR", "REQUESTED", request.getBankName(), "**** " + raw.substring(Math.max(0, raw.length() - 4)), "Awaiting finance review", requestedAt);
    }

    @Override
    public void seedInitialDataIfEmpty(String providerId) {
        // Real accounts start with no earnings. Demo data is never created on reads.
    }
}
