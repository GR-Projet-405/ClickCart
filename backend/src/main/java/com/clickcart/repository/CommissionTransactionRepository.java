package com.clickcart.repository;

import com.clickcart.model.CommissionTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommissionTransactionRepository extends MongoRepository<CommissionTransaction, String> {
    @org.springframework.data.mongodb.repository.Query("{ '_id': ?0, 'publicId': null }")
    @org.springframework.data.mongodb.repository.Update("{ '$set': { 'publicId': ?1 } }")
    void assignPublicId(String id, String publicId);
    long countByStatus(CommissionTransaction.TransactionStatus status);
}
