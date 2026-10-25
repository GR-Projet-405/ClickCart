package com.clickcart.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilitySlotResponse {

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;

    public AvailabilitySlotResponse(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            boolean available
    ) {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public boolean isAvailable() {
        return available;
    }
}