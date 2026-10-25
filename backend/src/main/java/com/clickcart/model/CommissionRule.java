package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Document("commission_rules")
public class CommissionRule {
    @Id private String id;
    private String ruleName;
    private String description;
    private String category;
    private CommissionType commissionType;
    private BigDecimal rate;
    private BigDecimal minimumFee;
    private BigDecimal maximumFee;
    private BigDecimal fixedFee;
    private ProviderTier providerTier;
    private int priority;
    private RuleStatus status;
    private Instant effectiveStartDate;
    private Instant expiryDate;
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
    @Version private Long version;

    public CommissionRule() {}
    public CommissionRule(String ruleName, String description, String category, CommissionType commissionType, BigDecimal rate,
                          BigDecimal minimumFee, BigDecimal maximumFee, BigDecimal fixedFee, ProviderTier providerTier, int priority,
                          RuleStatus status, Instant effectiveStartDate, Instant expiryDate, String createdBy) {
        this.id = UUID.randomUUID().toString();
        this.ruleName = ruleName; this.description = description; this.category = category; this.commissionType = commissionType;
        this.rate = rate; this.minimumFee = minimumFee; this.maximumFee = maximumFee; this.fixedFee = fixedFee;
        this.providerTier = providerTier; this.priority = priority; this.status = status; this.effectiveStartDate = effectiveStartDate; this.expiryDate = expiryDate;
        this.createdBy = createdBy; this.createdAt = Instant.now(); this.updatedAt = this.createdAt; this.version = null;
    }
    public String getId() { return id; } public String getRuleName() { return ruleName; } public String getDescription() { return description; }
    public String getCategory() { return category; } public CommissionType getCommissionType() { return commissionType; } public BigDecimal getRate() { return rate; }
    public BigDecimal getMinimumFee() { return minimumFee; } public BigDecimal getMaximumFee() { return maximumFee; } public BigDecimal getFixedFee() { return fixedFee; }
    public ProviderTier getProviderTier() { return providerTier; } public int getPriority() { return priority; } public RuleStatus getStatus() { return status; } public Instant getEffectiveStartDate() { return effectiveStartDate; }
    public Instant getExpiryDate() { return expiryDate; } public String getCreatedBy() { return createdBy; } public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; } public Long getVersion() { return version; }
    public void setStatus(RuleStatus status) { this.status = status; this.updatedAt = Instant.now(); }
    public void updateFrom(String ruleName, String description, String category, CommissionType commissionType, BigDecimal rate,
                           BigDecimal minimumFee, BigDecimal maximumFee, BigDecimal fixedFee, ProviderTier providerTier,
                           int priority, Instant effectiveStartDate, Instant expiryDate) {
        this.ruleName = ruleName; this.description = description; this.category = category; this.commissionType = commissionType;
        this.rate = rate; this.minimumFee = minimumFee; this.maximumFee = maximumFee; this.fixedFee = fixedFee;
        this.providerTier = providerTier; this.priority = priority; this.effectiveStartDate = effectiveStartDate; this.expiryDate = expiryDate;
        this.updatedAt = Instant.now();
    }
    public enum CommissionType { PERCENTAGE, FIXED_FEE, HYBRID }
    public enum ProviderTier { ALL, GOLD, SILVER, BRONZE }
    public enum RuleStatus { ACTIVE, PAUSED }
}
