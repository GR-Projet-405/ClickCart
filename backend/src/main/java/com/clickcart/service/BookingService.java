package com.clickcart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.clickcart.dto.BookingResponse;
import com.clickcart.dto.CreateBookingRequest;
import com.clickcart.exception.BookingException;
import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;
import com.clickcart.repository.BookingRepository;

@Service
public class BookingService {

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

    // DEV-16: Booking Creation
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

        // BookingStatus is used by the incoming provider booking workflow.
        booking.setStatus(BookingStatus.PENDING_APPROVAL);

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
            throw new IllegalArgumentException(
                "Start time must be a supported booking time slot"
            );
        }
    }

    // Incoming dev: Provider booking management
    public List<BookingResponse> listPending(String providerId, String sort) {
        if (sort != null && !sort.equalsIgnoreCase("newest") && !sort.equalsIgnoreCase("oldest")) {
            throw new BookingException(
                HttpStatus.BAD_REQUEST,
                "Sort must be newest or oldest"
            );
        }

        List<Booking> bookings;

        if ("oldest".equalsIgnoreCase(sort)) {
            bookings = bookingRepository
                .findByProviderIdAndStatusOrderByCreatedAtAsc(
                    providerId,
                    BookingStatus.PENDING_APPROVAL
                );
        } else {
            bookings = bookingRepository
                .findByProviderIdAndStatusOrderByCreatedAtDesc(
                    providerId,
                    BookingStatus.PENDING_APPROVAL
                );
        }

        return bookings.stream()
            .map(this::toResponse)
            .toList();
    }

    // Incoming dev: Provider booking management
    public BookingResponse get(String bookingId, String providerId) {
        return toResponse(requireOwned(bookingId, providerId));
    }

    // Incoming dev: Provider booking management
    public BookingResponse decide(
        String bookingId,
        String providerId,
        BookingStatus nextStatus
    ) {
        if (nextStatus != BookingStatus.ACCEPTED
                && nextStatus != BookingStatus.DECLINED) {
            throw new BookingException(
                HttpStatus.BAD_REQUEST,
                "Status must be ACCEPTED or DECLINED"
            );
        }

        Booking booking = requireOwned(bookingId, providerId);

        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new BookingException(
                HttpStatus.CONFLICT,
                "Only pending bookings can be decided"
            );
        }

        booking.setStatus(nextStatus);
        booking.setUnread(false);
        booking.setUpdatedAt(Instant.now());

        return toResponse(bookingRepository.save(booking));
    }

    // Incoming dev: Provider booking management
    private Booking requireOwned(String bookingId, String providerId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingException(
                HttpStatus.NOT_FOUND,
                "Booking not found"
            ));

        if (!providerId.equals(booking.getProviderId())) {
            throw new BookingException(
                HttpStatus.FORBIDDEN,
                "Booking does not belong to this provider"
            );
        }

        return booking;
    }

    // Incoming dev: Provider booking management
    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();

        response.setId(booking.getId());
        response.setServiceName(booking.getServiceName());
        response.setCustomerName(booking.getCustomerName());
        response.setCity(booking.getCity());
        response.setCountry(booking.getCountry());
        response.setScheduledAt(booking.getScheduledAt());
        response.setTimeSlot(booking.getTimeSlot());
        response.setEstimatedPay(booking.getEstimatedPay());
        response.setCurrency(booking.getCurrency());
        response.setNotes(booking.getNotes());
        response.setStatus(booking.getStatus());
        response.setUnread(booking.isUnread());
        response.setCreatedAt(booking.getCreatedAt());

        return response;
    }
}