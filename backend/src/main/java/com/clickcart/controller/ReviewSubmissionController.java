package com.clickcart.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.CreateReviewRequest;
import com.clickcart.dto.ReviewEligibilityResponse;
import com.clickcart.dto.ReviewResponse;
import com.clickcart.service.ReviewEligibilityGateway;
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
public class ReviewSubmissionController {

    private final ReviewEligibilityGateway eligibilityGateway;
    private final ReviewService reviewService;

    public ReviewSubmissionController(
            ReviewEligibilityGateway eligibilityGateway,
            ReviewService reviewService
    ) {
        this.eligibilityGateway = eligibilityGateway;
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader("X-Customer-Id")
            String customerId,
            @Valid @RequestBody
            CreateReviewRequest request
    ) {

        ReviewEligibilityResponse eligibility =
                eligibilityGateway.requireEligibleBooking(
                        request.getBookingId(),
                        customerId
                );

        if (eligibility.getProviderId() == null
                || eligibility.getProviderId().isBlank()) {

            throw new IllegalStateException(
                    "Eligible booking does not contain a provider ID"
            );
        }

        ReviewResponse createdReview =
                reviewService.createVerifiedReview(
                        request,
                        customerId,
                        eligibility.getProviderId(),
                        eligibility.getServiceId()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdReview);
    }
}
