package com.clickcart.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.clickcart.model.ServiceListingStatus;

public record ServiceListingResponse(
    String id,
    String title,
    String category,
    String description,
    BigDecimal priceFrom,
    BigDecimal priceTo,
    String priceUnit,
    String imageUrl,
    ServiceListingStatus status,
    Instant createdAt,
    Instant updatedAt
) {}
