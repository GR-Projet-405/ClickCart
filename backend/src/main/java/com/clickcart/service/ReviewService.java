package com.clickcart.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clickcart.dto.CreateReviewRequest;
import com.clickcart.dto.RatingSummaryResponse;
import com.clickcart.dto.ReviewResponse;
import com.clickcart.exception.ReviewNotFoundException;
import com.clickcart.model.ModerationStatus;
import com.clickcart.model.Review;
import com.clickcart.repository.ReviewRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
        private final ReviewModerationService moderationService;

    public ReviewService(
                        ReviewRepository reviewRepository,
                        ReviewModerationService moderationService
        ) {
                this.reviewRepository = reviewRepository;
                this.moderationService = moderationService;
        }

    /**
     * Booking/Auth integration will call this method after verifying:
     * - the booking exists
     * - the logged-in customer owns the booking
     * - the booking status is COMPLETED
     * - providerId/serviceId belong to that booking
     */
    public ReviewResponse createVerifiedReview(
            CreateReviewRequest request,
            String customerId,
            String providerId,
            String serviceId
    ) {
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new IllegalStateException(
                    "A review already exists for this booking"
            );
        }

        Review review = new Review();

        review.setBookingId(request.getBookingId());
        review.setCustomerId(customerId);
        review.setProviderId(providerId);
        review.setServiceId(serviceId);

        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());

        review.setPhotoUrls(
                request.getPhotoUrls() == null
                        ? new ArrayList<>()
                        : new ArrayList<>(request.getPhotoUrls())
        );

        review.setVerifiedBooking(true);

        ReviewModerationService.ModerationResult moderationResult =
                moderationService.moderate(review.getContent());

        review.setModerationStatus(
                moderationResult.status()
        );

        review.setModerationFlags(
                new ArrayList<>(moderationResult.flags())
        );

        review.setHelpfulCount(0);
        review.setReported(false);

        Instant now = Instant.now();

        review.setCreatedAt(now);
        review.setUpdatedAt(now);

        Review savedReview = reviewRepository.save(review);

        return toResponse(savedReview);
    }

    public ReviewResponse getReviewById(String reviewId) {
        return toResponse(findReview(reviewId));
    }

    public List<ReviewResponse> getProviderReviews(String providerId) {
        return reviewRepository
                .findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReviewResponse> getPublishedProviderReviews(
            String providerId
    ) {
        return reviewRepository
                .findByProviderIdAndModerationStatusOrderByCreatedAtDesc(
                        providerId,
                        ModerationStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReviewResponse> getCustomerReviews(String customerId) {
        return reviewRepository
                .findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewResponse markHelpful(String reviewId) {
        Review review = findReview(reviewId);

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        review.setUpdatedAt(Instant.now());

        return toResponse(reviewRepository.save(review));
    }

    public ReviewResponse reportReview(String reviewId) {
        Review review = findReview(reviewId);

        review.setReported(true);
        review.setModerationStatus(ModerationStatus.PENDING_REVIEW);

        List<String> flags =
                review.getModerationFlags() == null
                        ? new ArrayList<>()
                        : new ArrayList<>(review.getModerationFlags());

        if (!flags.contains("USER_REPORTED")) {
            flags.add("USER_REPORTED");
        }

        review.setModerationFlags(flags);
        review.setUpdatedAt(Instant.now());

        return toResponse(reviewRepository.save(review));
    }

    public ReviewResponse addProviderResponse(
            String reviewId,
            String providerId,
            String response
    ) {
        Review review = findReview(reviewId);

        if (!providerId.equals(review.getProviderId())) {
            throw new IllegalStateException(
                    "You are not authorized to respond to this review"
            );
        }

        if (response == null || response.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Provider response is required"
            );
        }

        String cleanedResponse = response.trim();

        if (cleanedResponse.length() > 300) {
            throw new IllegalArgumentException(
                    "Provider response must not exceed 300 characters"
            );
        }

        review.setProviderResponse(cleanedResponse);
        review.setUpdatedAt(Instant.now());

        return toResponse(reviewRepository.save(review));
    }

    public RatingSummaryResponse getRatingSummary(String providerId) {

        /*
         * Public rating statistics should only include reviews that
         * have successfully reached PUBLISHED status.
         */
        List<Review> reviews =
                reviewRepository
                        .findByProviderIdAndModerationStatusOrderByCreatedAtDesc(
                                providerId,
                                ModerationStatus.PUBLISHED
                        );

        Map<Integer, Long> distribution = new LinkedHashMap<>();

        distribution.put(5, 0L);
        distribution.put(4, 0L);
        distribution.put(3, 0L);
        distribution.put(2, 0L);
        distribution.put(1, 0L);

        if (reviews.isEmpty()) {
            return new RatingSummaryResponse(
                    0.0,
                    0,
                    distribution
            );
        }

        long totalRating = 0;

        for (Review review : reviews) {
            int rating = review.getRating();

            totalRating += rating;

            distribution.computeIfPresent(
                    rating,
                    (key, value) -> value + 1
            );
        }

        double average =
                (double) totalRating / reviews.size();

        double roundedAverage =
                Math.round(average * 10.0) / 10.0;

        return new RatingSummaryResponse(
                roundedAverage,
                reviews.size(),
                distribution
        );
    }

    private Review findReview(String reviewId) {
    return reviewRepository
            .findById(reviewId)
            .orElseThrow(
                    () -> new ReviewNotFoundException(reviewId)
            );
}

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();

        response.setId(review.getId());
        response.setBookingId(review.getBookingId());
        response.setCustomerId(review.getCustomerId());
        response.setProviderId(review.getProviderId());
        response.setServiceId(review.getServiceId());

        response.setRating(review.getRating());
        response.setContent(review.getContent());

        response.setPhotoUrls(
                review.getPhotoUrls() == null
                        ? List.of()
                        : review.getPhotoUrls()
        );

        response.setVerifiedBooking(review.isVerifiedBooking());

        response.setModerationStatus(
                review.getModerationStatus()
        );

        response.setModerationFlags(
                review.getModerationFlags() == null
                        ? List.of()
                        : review.getModerationFlags()
        );

        response.setProviderResponse(
                review.getProviderResponse()
        );

        response.setHelpfulCount(
                review.getHelpfulCount()
        );

        response.setReported(
                review.isReported()
        );

        response.setCreatedAt(
                review.getCreatedAt()
        );

        response.setUpdatedAt(
                review.getUpdatedAt()
        );

        return response;
    }
}