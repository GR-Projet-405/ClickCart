package com.clickcart.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;

public class BookingResponse {

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
    private Booking.PriceSnapshot priceSnapshot;

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

    public BookingResponse() {
    }

    private BookingResponse(Booking booking) {
        this.id = booking.getId();

        this.customerId = booking.getCustomerId();
        this.serviceId = booking.getServiceId();
        this.providerId = booking.getProviderId();
        this.serviceAddressId = booking.getServiceAddressId();
        this.serviceTitle = booking.getServiceTitle();
        this.bookingDate = booking.getBookingDate();
        this.startTime = booking.getStartTime();
        this.additionalDetails = booking.getAdditionalDetails();
        this.contactFullName = booking.getContactFullName();
        this.contactPhone = booking.getContactPhone();
        this.contactEmail = booking.getContactEmail();
        this.preferredContactMethod = booking.getPreferredContactMethod();
        this.priceSnapshot = booking.getPriceSnapshot();

        this.serviceName = booking.getServiceName();
        this.customerName = booking.getCustomerName();
        this.city = booking.getCity();
        this.country = booking.getCountry();
        this.scheduledAt = booking.getScheduledAt();
        this.timeSlot = booking.getTimeSlot();
        this.estimatedPay = booking.getEstimatedPay();
        this.currency = booking.getCurrency();
        this.notes = booking.getNotes();
        this.status = booking.getStatus();
        this.unread = booking.isUnread();
        this.createdAt = booking.getCreatedAt();
    }

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
            Objects.requireNonNull(booking, "booking must not be null")
        );
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

    public Booking.PriceSnapshot getPriceSnapshot() {
        return priceSnapshot;
    }

    public void setPriceSnapshot(Booking.PriceSnapshot priceSnapshot) {
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
}