package com.clickcart.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
@CompoundIndex(name = "provider_status_created", def = "{'providerId': 1, 'status': 1, 'createdAt': -1}")
public class Booking {

    @Id
    private String id;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String serviceId;
    private String serviceTitle;
    private String serviceName;
    private String serviceCategory;
    private String imageUrl;
    private String providerId;
    private String providerName;
    private String providerAvatar;
    private Double providerRating;
    private Integer providerReviewCount;
    private String bookingDate;
    private String city;
    private String country;
    private Instant scheduledAt;
    private String timeSlot;
    private String location;
    private String address;
    private Double totalCost;
    private BigDecimal estimatedPay;
    private String currency;
    private BookingStatus status;
    private String statusLabel;
    private boolean unread;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public Booking() {
    }

    public Booking(String id, String customerId, String customerName, String customerEmail, String customerPhone,
                   String serviceId, String serviceTitle, String serviceCategory, String imageUrl,
                   String providerId, String providerName, String providerAvatar, Double providerRating,
                   Integer providerReviewCount, String bookingDate, String timeSlot, String location,
                   String address, Double totalCost, String currency, BookingStatus status, String statusLabel,
                   String notes, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.serviceId = serviceId;
        this.serviceTitle = serviceTitle;
        this.serviceName = serviceTitle;
        this.serviceCategory = serviceCategory;
        this.imageUrl = imageUrl;
        this.providerId = providerId;
        this.providerName = providerName;
        this.providerAvatar = providerAvatar;
        this.providerRating = providerRating;
        this.providerReviewCount = providerReviewCount;
        this.bookingDate = bookingDate;
        this.timeSlot = timeSlot;
        this.location = location;
        this.address = address;
        this.totalCost = totalCost;
        if (totalCost != null) {
            this.estimatedPay = BigDecimal.valueOf(totalCost);
        }
        this.currency = currency;
        this.status = status;
        this.statusLabel = statusLabel;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Booking(String id, String customerId, String customerName, String customerEmail, String customerPhone,
                   String serviceId, String serviceTitle, String serviceCategory, String imageUrl,
                   String providerId, String providerName, String providerAvatar, Double providerRating,
                   Integer providerReviewCount, String bookingDate, String timeSlot, String location,
                   String address, Double totalCost, String currency, String status, String statusLabel,
                   String notes, Instant createdAt, Instant updatedAt) {
        this(id, customerId, customerName, customerEmail, customerPhone, serviceId, serviceTitle, serviceCategory,
                imageUrl, providerId, providerName, providerAvatar, providerRating, providerReviewCount,
                bookingDate, timeSlot, location, address, totalCost, currency,
                status != null ? BookingStatus.valueOf(status.toUpperCase().replace(" ", "_")) : null,
                statusLabel, notes, createdAt, updatedAt);
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
        if (this.serviceName == null) {
            this.serviceName = serviceTitle;
        }
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
        if (this.serviceTitle == null) {
            this.serviceTitle = serviceName;
        }
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
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
        if (totalCost != null && this.estimatedPay == null) {
            this.estimatedPay = BigDecimal.valueOf(totalCost);
        }
    }

    public BigDecimal getEstimatedPay() {
        return estimatedPay;
    }

    public void setEstimatedPay(BigDecimal estimatedPay) {
        this.estimatedPay = estimatedPay;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public void setStatus(String status) {
        if (status != null) {
            try {
                this.status = BookingStatus.valueOf(status.toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                this.status = null;
            }
        } else {
            this.status = null;
        }
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public boolean isUnread() {
        return unread;
    }

    public void setUnread(boolean unread) {
        this.unread = unread;
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
