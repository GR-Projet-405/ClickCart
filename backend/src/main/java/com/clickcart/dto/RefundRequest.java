package com.clickcart.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RefundRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    private String serviceName;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Description is required")
    private String description;

    private List<String> evidenceUrls;

    //getters / setters 
    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String v) {
        this.bookingId = v;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String v) {
        this.customerId = v;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String v) {
        this.serviceName = v;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double v) {
        this.amount = v;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String v) {
        this.reason = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        this.description = v;
    }

    public List<String> getEvidenceUrls() {
        return evidenceUrls;
    }

    public void setEvidenceUrls(List<String> v) {
        this.evidenceUrls = v;
    }
}
