package com.clickcart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.clickcart.dto.BookingResponse;
import com.clickcart.dto.CreateBookingRequest;
import com.clickcart.model.Booking;
import com.clickcart.repository.BookingRepository;

@Service
public class BookingService {

    private static final String CREATED_STATUS = "CREATED";
    // DEV-18 authentication will provide the real customer ID.
    private static final String TEMPORARY_CUSTOMER_ID = "DEV-18_PENDING_CUSTOMER";
    private static final Set<LocalTime> SUPPORTED_TIME_SLOTS = Set.of(
        LocalTime.of(9, 0),
        LocalTime.of(11, 0),
        LocalTime.of(14, 0),
        LocalTime.of(16, 0)
    );

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingResponse createBooking(CreateBookingRequest request) {
        validateRequest(request);

        Booking.PriceSnapshot priceSnapshot = new Booking.PriceSnapshot(
            request.getServiceFee(),
            request.getMaterialsCost(),
            request.getTravelCost(),
            request.getPlatformFee()
        );

        Booking booking = new Booking();
        booking.setCustomerId(TEMPORARY_CUSTOMER_ID);
        booking.setServiceId(request.getServiceId());
        booking.setProviderId(request.getProviderId());
        booking.setServiceAddressId(request.getServiceAddressId());
        booking.setServiceTitle(request.getServiceTitle());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setAdditionalDetails(request.getAdditionalDetails());
        booking.setContactFullName(request.getContactFullName());
        booking.setContactPhone(request.getContactPhone());
        booking.setContactEmail(request.getContactEmail());
        booking.setPreferredContactMethod(request.getPreferredContactMethod());
        booking.setPriceSnapshot(priceSnapshot);
        booking.setStatus(CREATED_STATUS);
        booking.setCreatedAt(Instant.now());

        Booking savedBooking = bookingRepository.save(booking);
        return BookingResponse.from(savedBooking);
    }

    private void validateRequest(CreateBookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request must not be null");
        }

        LocalDate bookingDate = request.getBookingDate();
        if (bookingDate == null || bookingDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }

        LocalTime startTime = request.getStartTime();
        if (startTime == null || !SUPPORTED_TIME_SLOTS.contains(startTime)) {
            throw new IllegalArgumentException("Start time must be a supported booking time slot");
        }
    }
}
