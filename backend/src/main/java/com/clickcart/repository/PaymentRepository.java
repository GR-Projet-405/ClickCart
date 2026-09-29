package com.clickcart.repository;

import com.clickcart.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByBookingId(String bookingId);

    Optional<Payment> findByReceiptNumber(String receiptNumber);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Payment> findByStatus(String status);
}
