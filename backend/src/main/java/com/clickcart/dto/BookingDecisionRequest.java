package com.clickcart.dto;

import com.clickcart.model.BookingStatus;

import jakarta.validation.constraints.NotNull;

public class BookingDecisionRequest {

    @NotNull
    private BookingStatus status;

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}