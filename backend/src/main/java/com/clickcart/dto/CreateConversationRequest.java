package com.clickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request body for creating a new conversation. */
public class CreateConversationRequest {

    @NotBlank(message = "bookingId is required")
    private String bookingId;

    @NotBlank(message = "customerId is required")
    private String customerId;

    @NotBlank(message = "providerId is required")
    private String providerId;

    private String serviceId;

    @NotBlank(message = "serviceName is required")
    private String serviceName;

    private String serviceCategory;

    @NotBlank(message = "customerName is required")
    private String customerName;

    private String customerAvatarFallback;

    @NotBlank(message = "providerName is required")
    private String providerName;

    private String providerAvatarFallback;

    private String bookingStatus = "Pending";

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerAvatarFallback() { return customerAvatarFallback; }
    public void setCustomerAvatarFallback(String customerAvatarFallback) { this.customerAvatarFallback = customerAvatarFallback; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderAvatarFallback() { return providerAvatarFallback; }
    public void setProviderAvatarFallback(String providerAvatarFallback) { this.providerAvatarFallback = providerAvatarFallback; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
}
