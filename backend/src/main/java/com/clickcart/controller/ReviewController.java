package com.clickcart.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ProviderReplyRequest;
import com.clickcart.dto.RatingSummaryResponse;
import com.clickcart.dto.ReviewResponse;
import com.clickcart.service.ReviewService;

import jakarta.validation.Valid;

@CrossOrigin(
        originPatterns = {
                "http://localhost:*",
                "http://127.0.0.1:*"
        }
)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable String reviewId
    ) {
        return ResponseEntity.ok(
                reviewService.getReviewById(reviewId)
        );
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponse>> getProviderReviews(
            @PathVariable String providerId
    ) {
        return ResponseEntity.ok(
                reviewService.getProviderReviews(providerId)
        );
    }

    @GetMapping("/provider/{providerId}/published")
    public ResponseEntity<List<ReviewResponse>>
    getPublishedProviderReviews(
            @PathVariable String providerId
    ) {
        return ResponseEntity.ok(
                reviewService.getPublishedProviderReviews(providerId)
        );
    }

    @GetMapping("/provider/{providerId}/summary")
    public ResponseEntity<RatingSummaryResponse> getRatingSummary(
            @PathVariable String providerId
    ) {
        return ResponseEntity.ok(
                reviewService.getRatingSummary(providerId)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewResponse>> getCustomerReviews(
            @PathVariable String customerId
    ) {
        return ResponseEntity.ok(
                reviewService.getCustomerReviews(customerId)
        );
    }

    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ReviewResponse> markHelpful(
            @PathVariable String reviewId
    ) {
        return ResponseEntity.ok(
                reviewService.markHelpful(reviewId)
        );
    }

    @PostMapping("/{reviewId}/report")
    public ResponseEntity<ReviewResponse> reportReview(
            @PathVariable String reviewId
    ) {
        return ResponseEntity.ok(
                reviewService.reportReview(reviewId)
        );
    }

    @PostMapping("/{reviewId}/response")
    public ResponseEntity<ReviewResponse> addProviderResponse(
            @PathVariable String reviewId,
            @RequestHeader("X-Provider-Id") String providerId,
            @Valid @RequestBody ProviderReplyRequest request
    ) {
        return ResponseEntity.ok(
                reviewService.addProviderResponse(
                        reviewId,
                        providerId,
                        request.getResponse()
                )
        );
    }
}