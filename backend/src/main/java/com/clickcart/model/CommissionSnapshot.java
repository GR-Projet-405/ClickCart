package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document("commission_snapshots")
public record CommissionSnapshot(@Id String id, String transactionId, String ruleId, String ruleName,
                                 CommissionRule.CommissionType type, BigDecimal rate,
                                 BigDecimal commissionAmount, Instant createdAt) {}
