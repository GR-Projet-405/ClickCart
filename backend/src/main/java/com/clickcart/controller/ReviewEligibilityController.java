package com.clickcart.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ReviewEligibilityResponse;
import com.clickcart.service.ReviewEligibilityGateway;

@RestController
@RequestMapping("/api/reviews/me")
public class ReviewEligibilityController {

    private final ReviewEligibilityGateway eligibilityGateway;

    public ReviewEligibilityController(
            ReviewEligibilityGateway eligibilityGateway
    ) {
        this.eligibilityGateway = eligibilityGateway;
    }

    @GetMapping("/eligibility")
    public ResponseEntity<ReviewEligibilityResponse>
    getEligibility(
            @RequestHeader(value = "X-Customer-Id", required = false)
            String customerId,
            @org.springframework.web.bind.annotation.RequestParam(required=false) String bookingId
    ) {

        customerId = com.clickcart.security.CurrentCustomer.id();

        if (bookingId != null && !bookingId.isBlank()) return ResponseEntity.ok(eligibilityGateway.requireEligibleBooking(bookingId, customerId));
        Optional<ReviewEligibilityResponse> eligibility =
                eligibilityGateway
                        .findEligibleBookingForCustomer(
                                customerId
                        );

        return eligibility
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.noContent().build()
                );
    }
}