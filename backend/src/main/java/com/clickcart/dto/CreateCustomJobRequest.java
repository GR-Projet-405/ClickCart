package com.clickcart.dto;

import java.time.Instant;

public record CreateCustomJobRequest(
    String customerId,
    String customerName,
    String customerPhone,
    String serviceTitle,
    String serviceCategory,
    String packageName,
    String address,
    String city,
    Double latitude,
    Double longitude,
    Instant scheduledStart,
    Instant scheduledEnd,
    Double serviceBaseFee,
    Double partsTopUp,
    String accessInstructions,
    String notes
) {
}
