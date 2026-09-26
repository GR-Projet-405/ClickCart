package com.clickcart.exception;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {

    private boolean success;
    private int status;
    private String error;
    private String message;
    private Map<String, String> fieldErrors;
    private Instant timestamp;

    public ErrorResponse() {
        this.success = false;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(int status, String error, String message) {
        this.success = false;
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(int status, String error, String message, Map<String, String> fieldErrors) {
        this.success = false;
        this.status = status;
        this.error = error;
        this.message = message;
        this.fieldErrors = fieldErrors;
        this.timestamp = Instant.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
