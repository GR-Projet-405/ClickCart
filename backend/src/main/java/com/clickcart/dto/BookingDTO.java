package com.clickcart.dto;

import com.clickcart.model.Booking;

import java.time.Instant;

public class BookingDTO {
    private String id;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String serviceId;
    private String serviceTitle;
    private String serviceCategory;
    private String imageUrl;
    private String providerId;
    private String providerName;
    private String providerAvatar;
    private Double providerRating;
    private Integer providerReviewCount;
    private String bookingDate;
    private String timeSlot;
    private String location;
    private String address;
    private Double totalCost;
    private String currency;
    private String status;
    private String statusLabel;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public BookingDTO() {
    }

    public BookingDTO(Booking booking) {
        if (booking != null) {
            this.id = booking.getId();
            this.customerId = booking.getCustomerId();
            this.customerName = booking.getCustomerName();
            this.customerEmail = booking.getCustomerEmail();
            this.customerPhone = booking.getCustomerPhone();
            this.serviceId = booking.getServiceId();
            this.serviceTitle = booking.getServiceTitle();
            this.serviceCategory = booking.getServiceCategory();
            this.imageUrl = booking.getImageUrl();
            this.providerId = booking.getProviderId();
            this.providerName = booking.getProviderName();
            this.providerAvatar = booking.getProviderAvatar();
            this.providerRating = booking.getProviderRating();
            this.providerReviewCount = booking.getProviderReviewCount();
            this.bookingDate = booking.getBookingDate();
            this.timeSlot = booking.getTimeSlot();
            this.location = booking.getLocation();
            this.address = booking.getAddress();
            this.totalCost = booking.getTotalCost();
            this.currency = booking.getCurrency();
            this.status = booking.getStatus() != null ? booking.getStatus().name() : null;
            this.statusLabel = booking.getStatusLabel();
            this.notes = booking.getNotes();
            this.createdAt = booking.getCreatedAt();
            this.updatedAt = booking.getUpdatedAt();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public String getProviderAvatar() {
        return providerAvatar;
    }

    public void setProviderAvatar(String providerAvatar) {
        this.providerAvatar = providerAvatar;
    }

    public Double getProviderRating() {
        return providerRating;
    }

    public void setProviderRating(Double providerRating) {
        this.providerRating = providerRating;
    }

    public Integer getProviderReviewCount() {
        return providerReviewCount;
    }

    public void setProviderReviewCount(Integer providerReviewCount) {
        this.providerReviewCount = providerReviewCount;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
