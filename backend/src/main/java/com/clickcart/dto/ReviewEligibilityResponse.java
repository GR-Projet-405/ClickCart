package com.clickcart.dto;

import java.time.Instant;

public class ReviewEligibilityResponse {

    private String bookingId;
    private String providerId;
    private String providerName;
    private String serviceId;
    private String serviceName;
    private Instant completedAt;
    private boolean eligible;

    public ReviewEligibilityResponse() {
    }

    public ReviewEligibilityResponse(
            String bookingId,
            String providerId,
            String providerName,
            String serviceId,
            String serviceName,
            Instant completedAt,
            boolean eligible
    ) {
        this.bookingId = bookingId;
        this.providerId = providerId;
        this.providerName = providerName;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.completedAt = completedAt;
        this.eligible = eligible;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }
}