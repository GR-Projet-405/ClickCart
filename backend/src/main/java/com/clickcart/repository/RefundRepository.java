package com.clickcart.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.Refund;

public interface RefundRepository extends MongoRepository<Refund, String> {

    List<Refund> findByCustomerIdOrderByRequestedAtDesc(String customerId);

    List<Refund> findByCustomerIdAndStatus(String customerId, String status);
}
