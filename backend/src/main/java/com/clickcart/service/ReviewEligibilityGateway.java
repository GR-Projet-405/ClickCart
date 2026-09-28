package com.clickcart.service;

import java.util.Optional;

import com.clickcart.dto.ReviewEligibilityResponse;

public interface ReviewEligibilityGateway {

    Optional<ReviewEligibilityResponse> findEligibleBookingForCustomer(
            String customerId
    );

    ReviewEligibilityResponse requireEligibleBooking(
            String bookingId,
            String customerId
    );
}