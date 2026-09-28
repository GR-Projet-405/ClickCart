package com.clickcart.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.clickcart.dto.CreateReviewRequest;
import com.clickcart.dto.RatingSummaryResponse;
import com.clickcart.dto.ReviewResponse;
import com.clickcart.model.ModerationStatus;
import com.clickcart.model.Review;
import com.clickcart.repository.ReviewRepository;

class ReviewServiceTest {

    private ReviewRepository reviewRepository;
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewRepository = Mockito.mock(ReviewRepository.class);

        reviewService = new ReviewService(
                reviewRepository,
                new ReviewModerationService()
        );

        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void shouldCreateVerifiedReview() {
        CreateReviewRequest request = new CreateReviewRequest();

        request.setBookingId("BK-1001");
        request.setRating(5);
        request.setContent(
                "Excellent service and very professional work."
        );
        request.setPhotoUrls(List.of());

        when(
                reviewRepository.existsByBookingId("BK-1001")
        ).thenReturn(false);

        ReviewResponse response =
                reviewService.createVerifiedReview(
                        request,
                        "customer-1",
                        "provider-1",
                        "service-1"
                );

        assertEquals("BK-1001", response.getBookingId());
        assertEquals("customer-1", response.getCustomerId());
        assertEquals("provider-1", response.getProviderId());
        assertEquals("service-1", response.getServiceId());

        assertEquals(5, response.getRating());
        assertTrue(response.isVerifiedBooking());

        assertEquals(
                ModerationStatus.PUBLISHED,
                response.getModerationStatus()
        );

        assertEquals(0, response.getHelpfulCount());
        assertFalse(response.isReported());

        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void shouldPreventDuplicateReviewForBooking() {
        CreateReviewRequest request = new CreateReviewRequest();

        request.setBookingId("BK-1001");
        request.setRating(5);
        request.setContent("Great service.");

        when(
                reviewRepository.existsByBookingId("BK-1001")
        ).thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> reviewService.createVerifiedReview(
                        request,
                        "customer-1",
                        "provider-1",
                        "service-1"
                )
        );

        assertEquals(
                "A review already exists for this booking",
                exception.getMessage()
        );

        verify(reviewRepository, never())
                .save(any(Review.class));
    }

    @Test
    void shouldIncrementHelpfulCount() {
        Review review = createReview();

        review.setHelpfulCount(2);

        when(
                reviewRepository.findById("review-1")
        ).thenReturn(Optional.of(review));

        ReviewResponse response =
                reviewService.markHelpful("review-1");

        assertEquals(3, response.getHelpfulCount());

        verify(reviewRepository).save(review);
    }

    @Test
    void shouldMarkReviewAsReported() {
        Review review = createReview();

        review.setModerationStatus(
                ModerationStatus.PUBLISHED
        );

        review.setModerationFlags(
                new ArrayList<>()
        );

        when(
                reviewRepository.findById("review-1")
        ).thenReturn(Optional.of(review));

        ReviewResponse response =
                reviewService.reportReview("review-1");

        assertTrue(response.isReported());

        assertEquals(
                ModerationStatus.PENDING_REVIEW,
                response.getModerationStatus()
        );

        assertTrue(
                response
                        .getModerationFlags()
                        .contains("USER_REPORTED")
        );
    }

    @Test
    void shouldRejectResponseFromDifferentProvider() {
        Review review = createReview();

        review.setProviderId("provider-1");

        when(
                reviewRepository.findById("review-1")
        ).thenReturn(Optional.of(review));

        assertThrows(
                IllegalStateException.class,
                () -> reviewService.addProviderResponse(
                        "review-1",
                        "provider-2",
                        "Thank you for your feedback."
                )
        );

        verify(reviewRepository, never())
                .save(any(Review.class));
    }

    @Test
    void shouldAddProviderResponseForCorrectProvider() {
        Review review = createReview();

        review.setProviderId("provider-1");

        when(
                reviewRepository.findById("review-1")
        ).thenReturn(Optional.of(review));

        ReviewResponse response =
                reviewService.addProviderResponse(
                        "review-1",
                        "provider-1",
                        "Thank you for your feedback."
                );

        assertEquals(
                "Thank you for your feedback.",
                response.getProviderResponse()
        );

        verify(reviewRepository).save(review);
    }

    @Test
    void shouldCalculatePublishedRatingSummary() {
        Review review1 = createReview();
        review1.setRating(5);

        Review review2 = createReview();
        review2.setRating(4);

        Review review3 = createReview();
        review3.setRating(5);

        when(
                reviewRepository
                        .findByProviderIdAndModerationStatusOrderByCreatedAtDesc(
                                "provider-1",
                                ModerationStatus.PUBLISHED
                        )
        ).thenReturn(
                List.of(review1, review2, review3)
        );

        RatingSummaryResponse summary =
                reviewService.getRatingSummary(
                        "provider-1"
                );

        assertEquals(4.7, summary.getAverageRating());
        assertEquals(3, summary.getTotalReviews());

        assertEquals(
                2L,
                summary.getDistribution().get(5)
        );

        assertEquals(
                1L,
                summary.getDistribution().get(4)
        );

        assertEquals(
                0L,
                summary.getDistribution().get(3)
        );
    }

    private Review createReview() {
        Review review = new Review();

        review.setId("review-1");
        review.setBookingId("BK-1001");
        review.setCustomerId("customer-1");
        review.setProviderId("provider-1");
        review.setServiceId("service-1");

        review.setRating(5);
        review.setContent("Excellent service.");

        review.setPhotoUrls(new ArrayList<>());
        review.setVerifiedBooking(true);

        review.setModerationStatus(
                ModerationStatus.PUBLISHED
        );

        review.setModerationFlags(
                new ArrayList<>()
        );

        review.setHelpfulCount(0);
        review.setReported(false);

        return review;
    }
}