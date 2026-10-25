package com.clickcart.dto;

import com.clickcart.model.AvailabilityRule;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AvailabilityRuleResponse {

    private String id;
    private String providerId;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AvailabilityRuleResponse() {
    }

    public AvailabilityRuleResponse(AvailabilityRule rule) {
        this.id = rule.getId();
        this.providerId = rule.getProviderId();
        this.dayOfWeek = rule.getDayOfWeek();
        this.startTime = rule.getStartTime();
        this.endTime = rule.getEndTime();
        this.active = rule.isActive();
        this.createdAt = rule.getCreatedAt();
        this.updatedAt = rule.getUpdatedAt();
    }

    public String getId() {
        return id;
    }

    public String getProviderId() {
        return providerId;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}