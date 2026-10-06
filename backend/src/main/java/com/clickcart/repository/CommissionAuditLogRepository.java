package com.clickcart.repository;

import com.clickcart.model.CommissionAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommissionAuditLogRepository extends MongoRepository<CommissionAuditLog, String> {
}
