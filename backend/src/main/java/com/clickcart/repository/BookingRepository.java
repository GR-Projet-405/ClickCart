package com.clickcart.repository;

import com.clickcart.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByCustomerId(String customerId);
    List<Booking> findByCustomerIdAndStatusIn(String customerId, List<String> statuses);
    long countByCustomerIdAndStatusIn(String customerId, List<String> statuses);
}
