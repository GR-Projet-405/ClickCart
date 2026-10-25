package com.clickcart.dto;

import java.time.Instant;
import java.util.List;

import com.clickcart.model.JobStatus;

public record ProviderJobSummaryDto(
    String id,
    String publicCode,
    String bookingCode,
    JobStatus status,
    String serviceTitle,
    String serviceCategory,
    String customerName,
    String customerPhone,
    String customerAvatarUrl,
    String address,
    String city,
    Double latitude,
    Double longitude,
    Double distanceKm,
    Integer etaMinutes,
    String transitNote,
    Instant scheduledStart,
    Instant scheduledEnd,
    Instant startedAt,
    Instant completedAt,
    String paymentHold,
    Double netPayout,
    String progressLabel,
    Integer progressPercent
) {
}
