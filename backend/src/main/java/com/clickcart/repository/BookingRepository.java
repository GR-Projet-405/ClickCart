package com.clickcart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByCustomerId(String customerId);

    List<Booking> findByCustomerIdAndStatusIn(String customerId, List<BookingStatus> statuses);

    long countByCustomerIdAndStatusIn(String customerId, List<BookingStatus> statuses);

    List<Booking> findByProviderIdAndStatusOrderByCreatedAtDesc(
            String providerId,
            BookingStatus status);

    List<Booking> findByProviderIdAndStatusOrderByCreatedAtAsc(
            String providerId,
            BookingStatus status);

    Optional<Booking> findByIdAndProviderId(String id, String providerId);
}