package com.clickcart.service;

import com.clickcart.model.CommissionRule;
import com.clickcart.model.CommissionRule.ProviderTier;
import com.clickcart.model.CommissionRule.RuleStatus;
import com.clickcart.repository.CommissionRuleRepository;
import com.clickcart.repository.CommissionSnapshotRepository;
import com.clickcart.repository.CommissionAuditLogRepository;
import com.clickcart.model.CommissionAuditLog;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.Comparator;
import java.util.List;

@Service
public class CommissionRuleService {
    private final CommissionRuleRepository rules;
    private final CommissionSnapshotRepository snapshots;
    private final CommissionCalculatorService calculator;
    private final CommissionAuditLogRepository auditLogs;

    public CommissionRuleService(CommissionRuleRepository rules, CommissionSnapshotRepository snapshots, CommissionCalculatorService calculator, CommissionAuditLogRepository auditLogs) {
        this.rules = rules; this.snapshots = snapshots; this.calculator = calculator; this.auditLogs = auditLogs;
    }

    public List<CommissionRule> list() { return rules.findAllByOrderByPriorityDescEffectiveStartDateDesc(); }
    public CommissionRule get(String id) { return rules.findById(id).orElseThrow(() -> new NotFoundException("Commission rule not found")); }

    public CommissionRule create(RuleRequest request, String actor) {
        validate(request);
        CommissionRule created = rules.save(request.toEntity(actor));
        auditLogs.save(new CommissionAuditLog(UUID.randomUUID().toString(), "RULE_CREATED", actor, created.getId(), created.getRuleName(), Instant.now()));
        return created;
    }

    public CommissionRule update(String id, long expectedVersion, RuleRequest request) {
        validate(request);
        CommissionRule rule = get(id);
        if (!Long.valueOf(expectedVersion).equals(rule.getVersion())) throw new ConflictException("Commission rule has changed; refresh before updating");
        rule.updateFrom(request.ruleName(), request.description(), request.category(), request.commissionType(), request.rate(), request.minimumFee(), request.maximumFee(), request.fixedFee(), request.providerTier(), request.priority(), request.effectiveStartDate(), request.expiryDate());
        try { CommissionRule updated = rules.save(rule); auditLogs.save(new CommissionAuditLog(UUID.randomUUID().toString(), "RULE_UPDATED", rule.getCreatedBy(), id, rule.getRuleName(), Instant.now())); return updated; } catch (OptimisticLockingFailureException exception) { throw new ConflictException("Commission rule has changed; refresh before updating"); }
    }

    public CommissionRule updateStatus(String id, long expectedVersion, RuleStatus status) {
        CommissionRule rule = get(id);
        if (!Long.valueOf(expectedVersion).equals(rule.getVersion())) throw new ConflictException("Commission rule has changed; refresh before updating");
        rule.setStatus(status);
        CommissionRule updated = rules.save(rule);
        auditLogs.save(new CommissionAuditLog(UUID.randomUUID().toString(), "RULE_STATUS_CHANGED", rule.getCreatedBy(), id, status.name(), Instant.now()));
        return updated;
    }

    public CommissionRule match(String category, ProviderTier tier, Instant at) {
        return list().stream().filter(rule -> rule.getStatus() == RuleStatus.ACTIVE)
                .filter(rule -> rule.getCategory().equalsIgnoreCase(category) || rule.getCategory().equalsIgnoreCase("ALL"))
                .filter(rule -> tier == null || rule.getProviderTier() == ProviderTier.ALL || rule.getProviderTier() == tier)
                .filter(rule -> !at.isBefore(rule.getEffectiveStartDate()) && (rule.getExpiryDate() == null || at.isBefore(rule.getExpiryDate())))
                .sorted(Comparator.comparingInt(CommissionRule::getPriority).reversed()
                        .thenComparing(rule -> tier != null && rule.getProviderTier() == ProviderTier.ALL)
                        .thenComparing(CommissionRule::getEffectiveStartDate, Comparator.reverseOrder())
                        .thenComparing(CommissionRule::getId))
                .findFirst().orElseThrow(() -> new NotFoundException("No active commission rule matches the request"));
    }

    private void validate(RuleRequest request) {
        if (request.rate() == null || request.rate().compareTo(BigDecimal.ZERO) < 0 || request.rate().compareTo(BigDecimal.valueOf(100)) > 0) throw new IllegalArgumentException("Rate must be between 0 and 100");
        if (request.category() == null || request.category().isBlank()) throw new IllegalArgumentException("Category is required");
        if (request.minimumFee() != null && request.minimumFee().signum() < 0) throw new IllegalArgumentException("Minimum fee must not be negative");
        if (request.maximumFee() != null && request.maximumFee().signum() < 0) throw new IllegalArgumentException("Maximum fee must not be negative");
    }

    public record RuleRequest(String ruleName, String description, String category, CommissionRule.CommissionType commissionType, BigDecimal rate, BigDecimal minimumFee, BigDecimal maximumFee, BigDecimal fixedFee, ProviderTier providerTier, int priority, Instant effectiveStartDate, Instant expiryDate) {
        public CommissionRule toEntity(String actor) { return new CommissionRule(ruleName, description, category, commissionType, rate, minimumFee, maximumFee, fixedFee, providerTier, 0, CommissionRule.RuleStatus.ACTIVE, effectiveStartDate == null ? Instant.now() : effectiveStartDate, expiryDate, actor); }
    }
    public static class NotFoundException extends RuntimeException { public NotFoundException(String message) { super(message); } }
    public static class ConflictException extends RuntimeException { public ConflictException(String message) { super(message); } }
}
