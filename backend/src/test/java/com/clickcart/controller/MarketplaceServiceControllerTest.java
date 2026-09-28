package com.clickcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.model.ServiceListingStatus;
import com.clickcart.service.ServiceListingService;
import com.clickcart.util.JwtUtil;

@WebMvcTest(MarketplaceServiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class MarketplaceServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ServiceListingService serviceListingService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void shouldRejectInvalidPriceRange() throws Exception {
        mockMvc.perform(get("/api/services")
                .param("minPrice", "200")
                .param("maxPrice", "100"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Bad Request"))
            .andExpect(jsonPath("$.message").value("minPrice cannot be greater than maxPrice"));
    }

    @Test
    void shouldReturnMarketplaceResultsWithOptionalFilters() throws Exception {
        ServiceListingResponse response = new ServiceListingResponse(
            "svc-1",
            "Deep Cleaning",
            "Cleaning",
            "Premium home cleaning",
            new BigDecimal("1500"),
            new BigDecimal("2500"),
            "job",
            "https://img.example.com/a.jpg",
            ServiceListingStatus.ACTIVE,
            Instant.now(),
            Instant.now()
        );

        given(serviceListingService.searchMarketplace(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
            .willReturn(new PagedResponse<>(List.of(response), 0, 10, 1, 1, true));

        mockMvc.perform(get("/api/services")
                .param("category", "Cleaning")
                .param("location", "Colombo")
                .param("minPrice", "1000")
                .param("maxPrice", "3000")
                .param("minRating", "4")
                .param("availability", "today_tomorrow")
                .param("sortBy", "price_asc")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].id").value("svc-1"))
            .andExpect(jsonPath("$.content[0].category").value("Cleaning"));
    }
}
