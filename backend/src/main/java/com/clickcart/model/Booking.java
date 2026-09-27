package com.clickcart.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
@CompoundIndex(
    name = "provider_status_created",
    def = "{'providerId': 1, 'status': 1, 'createdAt': -1}"
)
public class Booking {

    @Id
    private String id;

    // Customer booking fields
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

    // Provider booking fields
    private String serviceName;
    private String customerName;
    private String city;
    private String country;
    private Instant scheduledAt;
    private String timeSlot;
    private BigDecimal estimatedPay;
    private String currency;
    private String notes;

    private BookingStatus status;
    private boolean unread;
    private Instant createdAt;
    private Instant updatedAt;

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

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public boolean isUnread() {
        return unread;
    }

    public void setUnread(boolean unread) {
        this.unread = unread;
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

        private BigDecimal valueOrZero(BigDecimal value) {
            return value == null ? BigDecimal.ZERO : value;
        }
    }
}