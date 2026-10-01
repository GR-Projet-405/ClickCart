package com.clickcart.controller;

import com.clickcart.repository.CommissionRuleRepository;
import com.clickcart.repository.CommissionSnapshotRepository;
import com.clickcart.repository.CommissionTransactionRepository;
import com.clickcart.repository.CommissionAuditLogRepository;
import com.clickcart.service.CommissionTransactionService;
import com.clickcart.service.CommissionTransactionService.TransactionRequest;
import com.clickcart.model.CommissionTransaction;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import com.clickcart.service.CommissionRuleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.stream.LongStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/commission")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class CommissionDashboardController {
    private final CommissionRuleRepository rules;
    private final CommissionTransactionRepository transactions;
    private final CommissionSnapshotRepository snapshots;
    private final CommissionAuditLogRepository auditLogs;
    private final CommissionTransactionService transactionService;

    public CommissionDashboardController(CommissionRuleRepository rules, CommissionTransactionRepository transactions, CommissionSnapshotRepository snapshots, CommissionAuditLogRepository auditLogs, CommissionTransactionService transactionService) {
        this.rules = rules; this.transactions = transactions; this.snapshots = snapshots; this.auditLogs = auditLogs; this.transactionService = transactionService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        List<CommissionTransaction> ledger = transactions.findAll();
        List<CommissionTransaction> paidLedger = ledger.stream().filter(entry -> entry.status() == CommissionTransaction.TransactionStatus.SETTLED).toList();
        BigDecimal revenue = paidLedger.stream().map(CommissionTransaction::commissionAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal gross = paidLedger.stream().map(CommissionTransaction::bookingAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> categoryRevenue = paidLedger.stream().collect(Collectors.groupingBy(CommissionTransaction::category, Collectors.reducing(BigDecimal.ZERO, CommissionTransaction::commissionAmount, BigDecimal::add)));
        rules.findAll().stream().filter(rule -> rule.getStatus().name().equals("ACTIVE"))
                .map(rule -> rule.getCategory()).filter(category -> category != null && !category.isBlank())
                .forEach(category -> categoryRevenue.putIfAbsent(category, BigDecimal.ZERO));
        Map<String, BigDecimal> categoryDistribution = categoryRevenue.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, entry -> revenue.signum() == 0 ? BigDecimal.ZERO : entry.getValue().multiply(BigDecimal.valueOf(100)).divide(revenue, 2, java.math.RoundingMode.HALF_UP)));
        ZoneId reportingZone = ZoneId.of("Asia/Colombo");
        LocalDate today = LocalDate.now(reportingZone);
        Map<LocalDate, BigDecimal> dailyRevenue = paidLedger.stream()
                .filter(entry -> entry.date() != null)
                .collect(Collectors.groupingBy(entry -> entry.date().atZone(reportingZone).toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, CommissionTransaction::commissionAmount, BigDecimal::add)));
        LocalDate firstDay = dailyRevenue.keySet().stream().min(LocalDate::compareTo).orElse(today);
        LocalDate lastDay = dailyRevenue.keySet().stream().max(LocalDate::compareTo).filter(day -> day.isAfter(today)).orElse(today);
        List<Map<String, Object>> revenueTrend = LongStream.rangeClosed(0, ChronoUnit.DAYS.between(firstDay, lastDay)).mapToObj(offset -> {
            LocalDate day = firstDay.plusDays(offset);
            return Map.<String, Object>of("date", day.toString(), "value", dailyRevenue.getOrDefault(day, BigDecimal.ZERO));
        }).toList();
        return Map.of("totalRevenue", revenue, "activeRules", rules.findAll().stream().filter(rule -> rule.getStatus().name().equals("ACTIVE")).count(),
                "averageRate", gross.signum() == 0 ? BigDecimal.ZERO : revenue.multiply(BigDecimal.valueOf(100)).divide(gross, 2, java.math.RoundingMode.HALF_UP),
                "pendingCommissionRevenue", ledger.stream().filter(entry -> entry.status() == CommissionTransaction.TransactionStatus.PENDING).map(CommissionTransaction::commissionAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                "settledAmount", ledger.stream().filter(entry -> entry.status() == CommissionTransaction.TransactionStatus.SETTLED).map(CommissionTransaction::providerEarning).reduce(BigDecimal.ZERO, BigDecimal::add),
                "totalSettlements", ledger.stream().map(CommissionTransaction::providerEarning).reduce(BigDecimal.ZERO, BigDecimal::add), "revenueTrend", revenueTrend, "categoryDistribution", categoryDistribution, "recentHistory", ledger.stream().limit(10).toList(), "snapshotCount", snapshots.count());
    }

    @GetMapping("/transactions") public List<CommissionTransaction> transactions() { return transactionService.listWithPublicIds(); }
    @PostMapping("/transactions") public CommissionTransaction createTransaction(@RequestBody TransactionRequest request) { return transactionService.create(request); }
    @PutMapping("/transactions/{id}") public CommissionTransaction updateTransaction(@PathVariable String id, @RequestBody CommissionTransactionService.SplitUpdateRequest request, @RequestHeader("X-Split-Confirmation") String confirmationId) { return transactionService.update(id, request, confirmationId); }
    @DeleteMapping("/transactions/{id}") public void deleteTransaction(@PathVariable String id, @RequestHeader("X-Split-Confirmation") String confirmationId) { transactionService.delete(id, confirmationId); }
    @PatchMapping("/transactions/{id}/paid")
    public CommissionTransaction setPaid(@PathVariable String id, @RequestBody CommissionTransactionService.PaidRequest request,
                                         @RequestHeader("X-Split-Confirmation") String confirmationId) {
        return transactionService.setPaid(id, request.paid(), confirmationId);
    }
    @ExceptionHandler(CommissionRuleService.NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(CommissionRuleService.NotFoundException exception) { return Map.of("message", exception.getMessage()); }
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalid(IllegalArgumentException exception) { return Map.of("message", exception.getMessage()); }
    @ExceptionHandler(CommissionRuleService.ConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflict(CommissionRuleService.ConflictException exception) { return Map.of("message", exception.getMessage()); }
    @GetMapping("/snapshots") public Object snapshots() { return snapshots.findAll(); }
    @GetMapping("/audit-logs") public Object auditLogs() { return auditLogs.findAll(); }
}
