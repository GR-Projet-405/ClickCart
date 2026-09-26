package com.clickcart.controller;

import com.clickcart.dto.RatingSummaryResponse;
import com.clickcart.dto.ReviewResponse;
import com.clickcart.exception.GlobalExceptionHandler;
import com.clickcart.exception.ReviewNotFoundException;
import com.clickcart.model.ModerationStatus;
import com.clickcart.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
@Import(GlobalExceptionHandler.class)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

        @MockitoBean
    private ReviewService reviewService;

    @Test
    void shouldReturnRatingSummary() throws Exception {

        Map<Integer, Long> distribution = new LinkedHashMap<>();

        distribution.put(5, 82L);
        distribution.put(4, 12L);
        distribution.put(3, 4L);
        distribution.put(2, 1L);
        distribution.put(1, 1L);

        RatingSummaryResponse summary =
                new RatingSummaryResponse(
                        4.8,
                        100,
                        distribution
                );

        when(
                reviewService.getRatingSummary("provider-1")
        ).thenReturn(summary);

        mockMvc.perform(
                        get(
                                "/api/reviews/provider/provider-1/summary"
                        )
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.averageRating")
                                .value(4.8)
                )
                .andExpect(
                        jsonPath("$.totalReviews")
                                .value(100)
                )
                .andExpect(
                        jsonPath("$.distribution['5']")
                                .value(82)
                );
    }

    @Test
    void shouldReturnReviewById() throws Exception {

        ReviewResponse response = new ReviewResponse();

        response.setId("review-1");
        response.setBookingId("BK-1001");
        response.setProviderId("provider-1");
        response.setCustomerId("customer-1");
        response.setRating(5);
        response.setContent("Excellent service.");

        when(
                reviewService.getReviewById("review-1")
        ).thenReturn(response);

        mockMvc.perform(
                        get("/api/reviews/review-1")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.id")
                                .value("review-1")
                )
                .andExpect(
                        jsonPath("$.bookingId")
                                .value("BK-1001")
                )
                .andExpect(
                        jsonPath("$.rating")
                                .value(5)
                );
    }

    @Test
    void shouldReturn404WhenReviewDoesNotExist()
            throws Exception {

        when(
                reviewService.getReviewById("missing-review")
        ).thenThrow(
                new ReviewNotFoundException("missing-review")
        );

        mockMvc.perform(
                        get("/api/reviews/missing-review")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isNotFound())
                .andExpect(
                        jsonPath("$.status")
                                .value(404)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Not Found")
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Review not found: missing-review"
                                )
                );
    }

    @Test
    void shouldReturn400ForIllegalArgument()
            throws Exception {

        when(
                reviewService.getReviewById("invalid-review")
        ).thenThrow(
                new IllegalArgumentException(
                        "Invalid review request"
                )
        );

        mockMvc.perform(
                        get("/api/reviews/invalid-review")
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.status")
                                .value(400)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Bad Request")
                )
                .andExpect(
                        jsonPath("$.message")
                                .value("Invalid review request")
                );
    }

    @Test
    void shouldReturn409ForConflict()
            throws Exception {

        when(
                reviewService.markHelpful("review-1")
        ).thenThrow(
                new IllegalStateException(
                        "Review operation conflict"
                )
        );

        mockMvc.perform(
                        post(
                                "/api/reviews/review-1/helpful"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(status().isConflict())
                .andExpect(
                        jsonPath("$.status")
                                .value(409)
                )
                .andExpect(
                        jsonPath("$.error")
                                .value("Conflict")
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Review operation conflict"
                                )
                );
    }

    @Test
    void shouldMarkReviewHelpful() throws Exception {

        ReviewResponse response = new ReviewResponse();

        response.setId("review-1");
        response.setHelpfulCount(3);

        when(
                reviewService.markHelpful("review-1")
        ).thenReturn(response);

        mockMvc.perform(
                        post("/api/reviews/review-1/helpful")
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.id")
                                .value("review-1")
                )
                .andExpect(
                        jsonPath("$.helpfulCount")
                                .value(3)
                );
    }

    @Test
    void shouldReportReview() throws Exception {

        ReviewResponse response = new ReviewResponse();

        response.setId("review-1");
        response.setReported(true);
        response.setModerationStatus(
                ModerationStatus.PENDING_REVIEW
        );

        when(
                reviewService.reportReview("review-1")
        ).thenReturn(response);

        mockMvc.perform(
                        post("/api/reviews/review-1/report")
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.id")
                                .value("review-1")
                )
                .andExpect(
                        jsonPath("$.reported")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.moderationStatus")
                                .value("PENDING_REVIEW")
                );
    }

    @Test
    void shouldAddProviderResponse() throws Exception {

        ReviewResponse response = new ReviewResponse();
        response.setId("review-1");
        response.setProviderId("provider-1");
        response.setProviderResponse(
                "Thank you for your feedback."
        );

        when(
                reviewService.addProviderResponse(
                        "review-1",
                        "provider-1",
                        "Thank you for your feedback."
                )
        ).thenReturn(response);

        mockMvc.perform(
                        post("/api/reviews/review-1/response")
                                .header(
                                        "X-Provider-Id",
                                        "provider-1"
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "response":
                                          "Thank you for your feedback."
                                        }
                                        """)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.id")
                                .value("review-1")
                )
                .andExpect(
                        jsonPath("$.providerId")
                                .value("provider-1")
                )
                .andExpect(
                        jsonPath("$.providerResponse")
                                .value(
                                        "Thank you for your feedback."
                                )
                );
    }

    @Test
    void shouldRejectEmptyProviderResponse()
            throws Exception {

        mockMvc.perform(
                        post("/api/reviews/review-1/response")
                                .header(
                                        "X-Provider-Id",
                                        "provider-1"
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "response": ""
                                        }
                                        """)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value("Validation failed")
                )
                .andExpect(
                        jsonPath(
                                "$.validationErrors.response"
                        )
                                .value(
                                        "Provider response is required"
                                )
                );
    }

    @Test
    void shouldRejectProviderResponseOver300Characters()
            throws Exception {

        String longResponse = "a".repeat(301);

        String requestBody =
                """
                {
                  "response": "%s"
                }
                """.formatted(longResponse);

        mockMvc.perform(
                        post("/api/reviews/review-1/response")
                                .header(
                                        "X-Provider-Id",
                                        "provider-1"
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath(
                                "$.validationErrors.response"
                        )
                                .value(
                                        "Provider response must not exceed 300 characters"
                                )
                );
    }
}