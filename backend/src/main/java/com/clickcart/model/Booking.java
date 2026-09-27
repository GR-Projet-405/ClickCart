package com.clickcart.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    private String customerId;
    private String serviceId;
    private String providerId;
    private String serviceAddressId;
    private String serviceTitle;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private String additionalDetails;
    private String contactFullName;
    private String contactPhone;
    private String contactEmail;
    private String preferredContactMethod;
    private PriceSnapshot priceSnapshot;
    private String status;
    private Instant createdAt;

    public Booking() {
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

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
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
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(String additionalDetails) {
        this.additionalDetails = additionalDetails;
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

    public PriceSnapshot getPriceSnapshot() {
        return priceSnapshot;
    }

    public void setPriceSnapshot(PriceSnapshot priceSnapshot) {
        this.priceSnapshot = priceSnapshot;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public static class PriceSnapshot {

        private BigDecimal serviceFee;
        private BigDecimal materialsCost;
        private BigDecimal travelCost;
        private BigDecimal platformFee;
        private BigDecimal totalPrice;

        public PriceSnapshot() {
            recalculateTotalPrice();
        }

        public PriceSnapshot(
            BigDecimal serviceFee,
            BigDecimal materialsCost,
            BigDecimal travelCost,
            BigDecimal platformFee
        ) {
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

        private static BigDecimal valueOrZero(BigDecimal value) {
            return value == null ? BigDecimal.ZERO : value;
        }
    }
}
