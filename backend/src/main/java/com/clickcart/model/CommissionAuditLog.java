package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("commission_audit_logs")
public record CommissionAuditLog(@Id String id, String action, String actor, String ruleId, String details, Instant timestamp) {}
