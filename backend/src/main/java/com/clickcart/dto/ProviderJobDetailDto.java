package com.clickcart.dto;

import java.time.Instant;
import java.util.List;

import com.clickcart.model.JobStatus;

public record ProviderJobDetailDto(
    String id,
    String publicCode,
    String bookingCode,
    JobStatus status,
    String serviceTitle,
    String serviceCategory,
    String packageName,
    String slaLabel,
    String customerId,
    String customerName,
    String customerPhone,
    String customerAvatarUrl,
    Double customerRating,
    Integer customerPreviousBookings,
    boolean customerVerified,
    String customerMemberArea,
    String address,
    String city,
    Double latitude,
    Double longitude,
    String mapAreaLabel,
    Double distanceKm,
    Integer etaMinutes,
    String transitNote,
    String accessInstructions,
    Instant placedAt,
    Instant acceptedAt,
    Instant startedAt,
    Instant completedAt,
    Instant scheduledStart,
    Instant scheduledEnd,
    String paymentHold,
    Double serviceBaseFee,
    Double partsTopUp,
    Double platformCommission,
    Double netPayout,
    String progressLabel,
    Integer progressPercent,
    String completionNotes,
    List<DiagnosticDto> diagnostics,
    List<PhotoDto> photos,
    List<String> checklist
) {
    public record DiagnosticDto(String title, String detail) {
    }

    public record PhotoDto(
        String id,
        String originalName,
        String contentType,
        long sizeBytes,
        Instant uploadedAt
    ) {
    }
}
