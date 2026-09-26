package com.clickcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.clickcart.dto.CreateReviewRequest;
import com.clickcart.dto.ReviewEligibilityResponse;
import com.clickcart.dto.ReviewResponse;
import com.clickcart.service.ReviewEligibilityGateway;
import com.clickcart.service.ReviewService;

@WebMvcTest(ReviewSubmissionController.class)
class ReviewSubmissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReviewEligibilityGateway eligibilityGateway;

    @MockitoBean
    private ReviewService reviewService;

    @Test
    void shouldCreateVerifiedReviewForEligibleBooking()
            throws Exception {

        ReviewEligibilityResponse eligibility =
                new ReviewEligibilityResponse(
                        "BK-1001",
                        "provider-1",
                        "Service Provider",
                        "service-1",
                        "AC Repair",
                        Instant.parse(
                                "2026-09-26T10:00:00Z"
                        ),
                        true
                );

        ReviewResponse created =
                new ReviewResponse();

        created.setId("review-1");
        created.setBookingId("BK-1001");
        created.setCustomerId("customer-1");
        created.setProviderId("provider-1");
        created.setServiceId("service-1");
        created.setRating(5);
        created.setContent("Excellent service.");
        created.setVerifiedBooking(true);

        when(
                eligibilityGateway.requireEligibleBooking(
                        "BK-1001",
                        "customer-1"
                )
        ).thenReturn(eligibility);

        when(
                reviewService.createVerifiedReview(
                        any(CreateReviewRequest.class),
                        eq("customer-1"),
                        eq("provider-1"),
                        eq("service-1")
                )
        ).thenReturn(created);

        mockMvc.perform(
                        post("/api/reviews")
                                .header(
                                        "X-Customer-Id",
                                        "customer-1"
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "bookingId": "BK-1001",
                                          "rating": 5,
                                          "content": "Excellent service.",
                                          "photoUrls": []
                                        }
                                        """)
                )
                .andExpect(status().isCreated())
                .andExpect(
                        jsonPath("$.id")
                                .value("review-1")
                )
                .andExpect(
                        jsonPath("$.customerId")
                                .value("customer-1")
                )
                .andExpect(
                        jsonPath("$.providerId")
                                .value("provider-1")
                )
                .andExpect(
                        jsonPath("$.verifiedBooking")
                                .value(true)
                );
    }

    @Test
    void shouldRejectInvalidReviewRequest()
            throws Exception {

        mockMvc.perform(
                        post("/api/reviews")
                                .header(
                                        "X-Customer-Id",
                                        "customer-1"
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "bookingId": "",
                                          "rating": 6,
                                          "content": ""
                                        }
                                        """)
                )
                .andExpect(
                        status().isBadRequest()
                );
    }
}