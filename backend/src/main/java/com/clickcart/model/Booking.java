package com.clickcart.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
@CompoundIndex(name = "provider_status_created", def = "{'providerId': 1, 'status': 1, 'createdAt': -1}")
public class Booking {

    @Id
    private String id;

    // Customer & Contact Fields (Merged from HEAD and dev)
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String contactFullName;
    private String contactPhone;
    private String contactEmail;
    private String preferredContactMethod;

    // Service Fields
    private String serviceId;
    private String serviceAddressId;
    private String serviceTitle;
    private String serviceName;
    private String serviceCategory;
    private String imageUrl;

    // Provider Fields
    private String providerId;
    private String providerName;
    private String providerAvatar;
    private Double providerRating;
    private Integer providerReviewCount;

    // Date, Time & Location Fields
    private String bookingDate; // From HEAD (String format)
    private LocalDate bookingLocalDate; // From dev (LocalDate format)
    private LocalTime startTime;
    private String timeSlot;
    private Instant scheduledAt;
    private String city;
    private String country;
    private String location;
    private String address;

    // Pricing Fields
    private Double totalCost;
    private BigDecimal estimatedPay;
    private String currency;
    private PriceSnapshot priceSnapshot;

    // Status & Meta Fields
    private String additionalDetails;
    private String notes;
    private BookingStatus status;
    private String statusLabel;
    private boolean unread;
    private Instant createdAt;
    private Instant updatedAt;

    public Booking() {
    }

    // HEAD Branch Constructors
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

    // Getters and Setters

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

    public String getContactFullName() {
        return contactFullName;
    }

    public void setContactFullName(String contactFullName) {
        this.contactFullName = contactFullName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public void setPreferredContactMethod(String preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceAddressId() {
        return serviceAddressId;
    }

    public void setServiceAddressId(String serviceAddressId) {
        this.serviceAddressId = serviceAddressId;
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

    public LocalDate getBookingLocalDate() {
        return bookingLocalDate;
    }

    public void setBookingLocalDate(LocalDate bookingLocalDate) {
        this.bookingLocalDate = bookingLocalDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
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

    public PriceSnapshot getPriceSnapshot() {
        return priceSnapshot;
    }

    public void setPriceSnapshot(PriceSnapshot priceSnapshot) {
        this.priceSnapshot = priceSnapshot;
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

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(String additionalDetails) {
        this.additionalDetails = additionalDetails;
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

    // PriceSnapshot Inner Class (Merged from dev branch)
    public static class PriceSnapshot {

        private BigDecimal serviceFee;
        private BigDecimal materialsCost;
        private BigDecimal travelCost;
        private BigDecimal platformFee;
        private BigDecimal totalPrice;

        public PriceSnapshot() {
            recalculateTotalPrice();
        }

        public PriceSnapshot(BigDecimal serviceFee, BigDecimal materialsCost, BigDecimal travelCost,
                BigDecimal platformFee) {
            this.serviceFee = serviceFee;
            this.materialsCost = materialsCost;
            this.travelCost = travelCost;
            this.platformFee = platformFee;
            recalculateTotalPrice();
        }

        public BigDecimal getServiceFee() {
            return serviceFee;
        }

        public void setServiceFee(BigDecimal serviceFee) {
            this.serviceFee = serviceFee;
            recalculateTotalPrice();
        }

        public BigDecimal getMaterialsCost() {
            return materialsCost;
        }

        public void setMaterialsCost(BigDecimal materialsCost) {
            this.materialsCost = materialsCost;
            recalculateTotalPrice();
        }

        public BigDecimal getTravelCost() {
            return travelCost;
        }

        public void setTravelCost(BigDecimal travelCost) {
            this.travelCost = travelCost;
            recalculateTotalPrice();
        }

        public BigDecimal getPlatformFee() {
            return platformFee;
        }

        public void setPlatformFee(BigDecimal platformFee) {
            this.platformFee = platformFee;
            recalculateTotalPrice();
        }

        public BigDecimal getTotalPrice() {
            return totalPrice;
        }

        private void recalculateTotalPrice() {
            totalPrice = valueOrZero(serviceFee)
                    .add(valueOrZero(materialsCost))
                    .add(valueOrZero(travelCost))
                    .add(valueOrZero(platformFee));
        }

        private BigDecimal valueOrZero(BigDecimal value) {
            return value == null ? BigDecimal.ZERO : value;
        }
    }
}