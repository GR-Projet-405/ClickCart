package com.clickcart.repository;

import com.clickcart.model.CommissionSnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommissionSnapshotRepository extends MongoRepository<CommissionSnapshot, String> {
}
