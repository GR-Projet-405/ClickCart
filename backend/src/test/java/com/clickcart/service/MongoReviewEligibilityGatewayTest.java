package com.clickcart.service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.bson.Document;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import com.clickcart.dto.ReviewEligibilityResponse;
import com.clickcart.repository.ReviewRepository;

@ExtendWith(MockitoExtension.class)
class MongoReviewEligibilityGatewayTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private ReviewRepository reviewRepository;

    private MongoReviewEligibilityGateway gateway;

    @BeforeEach
    void setUp() {
        gateway = new MongoReviewEligibilityGateway(
                mongoTemplate,
                reviewRepository
        );
    }

    @Test
    void shouldReturnCompletedUnreviewedBooking() {

        Document job = new Document()
                .append("_id", "job-1")
                .append("bookingCode", "BK-1001")
                .append("customerId", "customer-1")
                .append("providerId", "provider-1")
                .append("serviceTitle", "AC Repair")
                .append("status", "COMPLETED")
                .append(
                        "completedAt",
                        Date.from(
                                Instant.parse(
                                        "2026-09-26T10:00:00Z"
                                )
                        )
                );

        when(
                mongoTemplate.find(
                        any(Query.class),
                        eq(Document.class),
                        eq("provider_jobs")
                )
        ).thenReturn(List.of(job));

        when(
                reviewRepository.existsByBookingId(
                        "BK-1001"
                )
        ).thenReturn(false);

        Optional<ReviewEligibilityResponse> result =
                gateway.findEligibleBookingForCustomer(
                        "customer-1"
                );

        assertTrue(result.isPresent());

        assertEquals(
                "BK-1001",
                result.get().getBookingId()
        );

        assertEquals(
                "provider-1",
                result.get().getProviderId()
        );

        assertEquals(
                "AC Repair",
                result.get().getServiceName()
        );

        assertTrue(
                result.get().isEligible()
        );
    }

    @Test
    void shouldSkipBookingThatAlreadyHasReview() {

        Document job = new Document()
                .append("bookingCode", "BK-1001")
                .append("customerId", "customer-1")
                .append("providerId", "provider-1")
                .append("status", "COMPLETED");

        when(
                mongoTemplate.find(
                        any(Query.class),
                        eq(Document.class),
                        eq("provider_jobs")
                )
        ).thenReturn(List.of(job));

        when(
                reviewRepository.existsByBookingId(
                        "BK-1001"
                )
        ).thenReturn(true);

        Optional<ReviewEligibilityResponse> result =
                gateway.findEligibleBookingForCustomer(
                        "customer-1"
                );

        assertTrue(result.isEmpty());
    }

    @Test
    void shouldRequireCompletedOwnedBooking() {

        when(
                mongoTemplate.findOne(
                        any(Query.class),
                        eq(Document.class),
                        eq("provider_jobs")
                )
        ).thenReturn(null);

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        gateway.requireEligibleBooking(
                                "BK-9999",
                                "customer-1"
                        )
        );
    }

    @Test
    void shouldRejectDuplicateReview() {

        Document job = new Document()
                .append("bookingCode", "BK-1001")
                .append("customerId", "customer-1")
                .append("providerId", "provider-1")
                .append("serviceTitle", "AC Repair")
                .append("status", "COMPLETED");

        when(
                mongoTemplate.findOne(
                        any(Query.class),
                        eq(Document.class),
                        eq("provider_jobs")
                )
        ).thenReturn(job);

        when(
                reviewRepository.existsByBookingId(
                        "BK-1001"
                )
        ).thenReturn(true);

        assertThrows(
                IllegalStateException.class,
                () ->
                        gateway.requireEligibleBooking(
                                "BK-1001",
                                "customer-1"
                        )
        );
    }
}