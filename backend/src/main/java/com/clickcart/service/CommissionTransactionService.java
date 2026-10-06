package com.clickcart.service;

import com.clickcart.model.CommissionRule;
import com.clickcart.model.CommissionSnapshot;
import com.clickcart.model.CommissionTransaction;
import com.clickcart.model.CommissionTransaction.TransactionStatus;
import com.clickcart.repository.CommissionSnapshotRepository;
import com.clickcart.repository.CommissionTransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class CommissionTransactionService {
    private final CommissionTransactionRepository transactions;
    private final CommissionSnapshotRepository snapshots;
    private final CommissionRuleService rules;
    private final CommissionCalculatorService calculator;

    public CommissionTransactionService(CommissionTransactionRepository transactions, CommissionSnapshotRepository snapshots, CommissionRuleService rules, CommissionCalculatorService calculator) {
        this.transactions = transactions; this.snapshots = snapshots; this.rules = rules; this.calculator = calculator;
    }

    public synchronized java.util.List<CommissionTransaction> listWithPublicIds() {
        var entries = transactions.findAll();
        var used = new java.util.HashSet<String>();
        entries.forEach(entry -> {
            if (entry.publicId() != null) used.add(entry.publicId());
            used.add(entry.transactionId());
        });
        boolean changed = false;
        for (var entry : entries) {
            if (entry.publicId() != null) continue;
            String publicId = entry.transactionId();
            if (!publicId.matches("[A-Z]{2}[0-9]{3}")) {
                int candidate = Math.floorMod(entry.transactionId().hashCode(), 676000);
                int attempts = 0;
                do {
                    if (attempts++ >= 676000) throw new IllegalStateException("No split IDs available");
                    publicId = "" + (char) ('A' + candidate / 26000) + (char) ('A' + candidate / 1000 % 26)
                            + String.format(java.util.Locale.ROOT, "%03d", candidate % 1000);
                    candidate = (candidate + 1) % 676000;
                } while (used.contains(publicId));
            }
            used.add(publicId);
            transactions.assignPublicId(entry.transactionId(), publicId);
            changed = true;
        }
        return changed ? transactions.findAll() : entries;
    }

    public CommissionTransaction create(TransactionRequest request) {
        return transactions.findById(request.transactionId()).map(existing -> {
            if (existing.bookingAmount().compareTo(request.bookingAmount()) != 0 || !existing.category().equals(request.category())) throw new CommissionRuleService.ConflictException("Transaction ID already exists with a different payload");
            return existing;
        }).orElseGet(() -> {
            CommissionRule rule = rules.match(request.category(), request.providerTier(), Instant.now());
            CommissionCalculatorService.Calculation result = calculator.calculate(request.bookingAmount(), rule);
            CommissionSnapshot snapshot = snapshots.save(new CommissionSnapshot(UUID.randomUUID().toString(), request.transactionId(), rule.getId(), rule.getRuleName(), rule.getCommissionType(), rule.getRate(), result.commissionAmount(), Instant.now()));
            return transactions.save(new CommissionTransaction(request.transactionId(), request.customer(), request.provider(), request.service(), result.grossAmount(), request.category(), result.commissionAmount(), result.providerPayout(), Instant.now(), TransactionStatus.PENDING, snapshot));
        });
    }

    public CommissionTransaction update(String id, SplitUpdateRequest request, String confirmationId) {
        CommissionTransaction existing = transactions.findById(id)
                .orElseThrow(() -> new CommissionRuleService.NotFoundException("Split not found"));
        confirmId(existing, confirmationId);
        if (request.bookingAmount() == null || request.bookingAmount().signum() <= 0
                || request.category() == null || request.category().isBlank()) {
            throw new IllegalArgumentException("A positive service amount and category are required");
        }
        CommissionRule rule = rules.match(request.category(), null, Instant.now());
        var result = calculator.calculate(request.bookingAmount(), rule);
        var snapshot = snapshots.save(new CommissionSnapshot(UUID.randomUUID().toString(), id,
                rule.getId(), rule.getRuleName(), rule.getCommissionType(), rule.getRate(), result.commissionAmount(), Instant.now()));
        return transactions.save(new CommissionTransaction(id, existing.customer(), existing.provider(),
                request.category(), result.grossAmount(), request.category(), result.commissionAmount(),
                result.providerPayout(), existing.date(), existing.status(), snapshot, existing.publicId()));
    }

    public void delete(String id, String confirmationId) {
        CommissionTransaction existing = transactions.findById(id)
                .orElseThrow(() -> new CommissionRuleService.NotFoundException("Split not found"));
        confirmId(existing, confirmationId);
        transactions.delete(existing);
    }

    private void confirmId(CommissionTransaction entry, String confirmationId) {
        String expected = entry.publicId() == null ? entry.transactionId() : entry.publicId();
        if (confirmationId == null || !expected.equalsIgnoreCase(confirmationId.trim())) {
            throw new IllegalArgumentException("Enter the split's unique ID to confirm this change");
        }
    }

    public CommissionTransaction setPaid(String id, Boolean paid, String confirmationId) {
        var existing = transactions.findById(id)
                .orElseThrow(() -> new CommissionRuleService.NotFoundException("Split not found"));
        confirmId(existing, confirmationId);
        if (paid == null) throw new IllegalArgumentException("Paid state is required");
        return transactions.save(new CommissionTransaction(existing.transactionId(), existing.customer(), existing.provider(),
                existing.service(), existing.bookingAmount(), existing.category(), existing.commissionAmount(),
                existing.providerEarning(), existing.date(), paid ? TransactionStatus.SETTLED : TransactionStatus.PENDING,
                existing.commissionSnapshot(), existing.publicId()));
    }

    public record PaidRequest(Boolean paid) {}

    public record SplitUpdateRequest(BigDecimal bookingAmount, String category) {}

    public record TransactionRequest(String transactionId, String customer, String provider, String service, BigDecimal bookingAmount, String category, CommissionRule.ProviderTier providerTier) {}
}
