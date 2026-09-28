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

@CrossOrigin(
        originPatterns = {
                "http://localhost:*",
                "http://127.0.0.1:*"
        }
)
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
            @RequestHeader("X-Customer-Id")
            String customerId
    ) {

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