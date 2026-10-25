package com.clickcart.exception;

public class AvailabilityConflictException extends RuntimeException {

    public AvailabilityConflictException(String message) {
        super(message);
    }
}