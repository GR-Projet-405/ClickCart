package com.clickcart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByProviderIdAndStatusOrderByCreatedAtDesc(
            String providerId, BookingStatus status);

    List<Booking> findByProviderIdAndStatusOrderByCreatedAtAsc(
            String providerId, BookingStatus status);

    Optional<Booking> findByIdAndProviderId(String id, String providerId);
}