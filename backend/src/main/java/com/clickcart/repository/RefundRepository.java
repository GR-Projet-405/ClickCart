package com.clickcart.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.Refund;

public interface RefundRepository extends MongoRepository<Refund, String> {

    List<Refund> findByCustomerIdOrderByRequestedAtDesc(String customerId);

    List<Refund> findByCustomerIdAndStatus(String customerId, String status);

    /** Find any refunds for a specific booking with the given status. */
    List<Refund> findByBookingIdAndStatus(String bookingId, String status);

    /** Find all refunds ever filed for a booking (across any status). */
    List<Refund> findByBookingId(String bookingId);
}
