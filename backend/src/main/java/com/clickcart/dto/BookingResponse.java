package com.clickcart.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

import com.clickcart.model.Booking;

public final class BookingResponse {

    private final String id;
    private final String customerId;
    private final String serviceId;
    private final String providerId;
    private final String serviceAddressId;
    private final String serviceTitle;
    private final LocalDate bookingDate;
    private final LocalTime startTime;
    private final String additionalDetails;
    private final String contactFullName;
    private final String contactPhone;
    private final String contactEmail;
    private final String preferredContactMethod;
    private final Booking.PriceSnapshot priceSnapshot;
    private final String status;
    private final Instant createdAt;

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
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(Objects.requireNonNull(booking, "booking must not be null"));
    }

    public String getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getServiceId() {
        return serviceId;
    }

    public String getProviderId() {
        return providerId;
    }

    public String getServiceAddressId() {
        return serviceAddressId;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public String getContactFullName() {
        return contactFullName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public Booking.PriceSnapshot getPriceSnapshot() {
        return priceSnapshot;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
