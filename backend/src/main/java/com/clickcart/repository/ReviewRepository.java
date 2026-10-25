package com.clickcart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.ModerationStatus;
import com.clickcart.model.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {

    boolean existsByBookingId(String bookingId);

    Optional<Review> findByBookingId(String bookingId);

    List<Review> findByProviderIdOrderByCreatedAtDesc(String providerId);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Review> findByProviderIdAndModerationStatusOrderByCreatedAtDesc(
            String providerId,
            ModerationStatus moderationStatus
    );
}