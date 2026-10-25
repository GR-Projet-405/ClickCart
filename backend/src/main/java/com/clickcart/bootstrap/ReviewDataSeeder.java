package com.clickcart.bootstrap;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.clickcart.model.ModerationStatus;
import com.clickcart.model.Review;
import com.clickcart.repository.ReviewRepository;

@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "clickcart.demo-data.enabled", havingValue = "true")
@Component
public class ReviewDataSeeder implements CommandLineRunner {

    public static final String PROVIDER_A = "provider-a";
    private static final ZoneId ZONE = ZoneId.of("Asia/Colombo");

    private final ReviewRepository repository;

    public ReviewDataSeeder(ReviewRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        List<Review> reviews = new ArrayList<>();
        ZonedDateTime now = ZonedDateTime.now(ZONE);

        // Add some reviews for provider-a
        reviews.add(createReview(
                "BOOK-001",
                "CL-8402",
                PROVIDER_A,
                "SVC-001",
                5,
                "Excellent service! The technician was professional and fixed my AC quickly.",
                now.minusDays(1).toInstant()
        ));

        reviews.add(createReview(
                "BOOK-002",
                "CL-5521",
                PROVIDER_A,
                "SVC-002",
                4,
                "Good work, but arrived a bit late. Still satisfied with the result.",
                now.minusDays(3).toInstant()
        ));

        reviews.add(createReview(
                "BOOK-003",
                "CL-2209",
                PROVIDER_A,
                "SVC-003",
                5,
                "Outstanding service! Will definitely book again.",
                now.minusDays(5).toInstant()
        ));

        repository.saveAll(reviews);
    }

    private Review createReview(String bookingId, String customerId, String providerId, String serviceId,
                                  int rating, String content, Instant createdAt) {
        Review review = new Review();
        review.setBookingId(bookingId);
        review.setCustomerId(customerId);
        review.setProviderId(providerId);
        review.setServiceId(serviceId);
        review.setRating(rating);
        review.setContent(content);
        review.setVerifiedBooking(true);
        review.setModerationStatus(ModerationStatus.PUBLISHED);
        review.setCreatedAt(createdAt);
        review.setUpdatedAt(createdAt);
        return review;
    }
}
