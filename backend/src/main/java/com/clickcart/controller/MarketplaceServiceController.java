package com.clickcart.controller;

import java.math.BigDecimal;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.service.ServiceListingService;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MarketplaceServiceController {

    private final ServiceListingService service;

    public MarketplaceServiceController(ServiceListingService service) {
        this.service = service;
    }

    @GetMapping
    public PagedResponse<ServiceListingResponse> listActiveServices(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) String minPrice,
        @RequestParam(required = false) String maxPrice,
        @RequestParam(required = false) String minRating,
        @RequestParam(required = false) String availability,
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "10") Integer size,
        @RequestParam(required = false) String q
    ) {
        BigDecimal parsedMinPrice = parseDecimal(minPrice, "minPrice");
        BigDecimal parsedMaxPrice = parseDecimal(maxPrice, "maxPrice");
        BigDecimal parsedMinRating = parseDecimal(minRating, "minRating");

        if (parsedMinPrice != null && parsedMaxPrice != null && parsedMinPrice.compareTo(parsedMaxPrice) > 0) {
            throw new IllegalArgumentException("minPrice cannot be greater than maxPrice");
        }

        return service.searchMarketplace(
            category,
            location,
            parsedMinPrice,
            parsedMaxPrice,
            parsedMinRating,
            availability,
            sortBy,
            q,
            page,
            size
        );
    }

    private BigDecimal parseDecimal(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(fieldName + " must be a valid number");
        }
    }
}
