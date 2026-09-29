package com.clickcart.dto;

import com.clickcart.model.BlockedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BlockedDateResponse {

    private String id;
    private String providerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BlockedDateResponse(BlockedDate blockedDate) {
        this.id = blockedDate.getId();
        this.providerId = blockedDate.getProviderId();
        this.startDate = blockedDate.getStartDate();
        this.endDate = blockedDate.getEndDate();
        this.reason = blockedDate.getReason();
        this.note = blockedDate.getNote();
        this.createdAt = blockedDate.getCreatedAt();
        this.updatedAt = blockedDate.getUpdatedAt();
    }

    public String getId() {
        return id;
    }

    public String getProviderId() {
        return providerId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getReason() {
        return reason;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}