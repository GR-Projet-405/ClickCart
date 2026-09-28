package com.clickcart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.clickcart.dto.BookingResponse;
import com.clickcart.exception.BookingException;
import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;
import com.clickcart.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookings;

    public BookingService(BookingRepository bookings) {
        this.bookings = bookings;
    }

    public List<BookingResponse> listPending(String providerId, String sort) {
        List<Booking> found;
        if (sort == null || "newest".equals(sort)) {
            found = bookings.findByProviderIdAndStatusOrderByCreatedAtDesc(
                    providerId, BookingStatus.PENDING_APPROVAL);
        } else if ("oldest".equals(sort)) {
            found = bookings.findByProviderIdAndStatusOrderByCreatedAtAsc(
                    providerId, BookingStatus.PENDING_APPROVAL);
        } else {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Sort must be newest or oldest");
        }
        return found.stream().map(this::toResponse).toList();
    }

    public BookingResponse get(String bookingId, String providerId) {
        return toResponse(requireOwned(bookingId, providerId));
    }

    public BookingResponse decide(String bookingId, String providerId, BookingStatus nextStatus) {
        if (nextStatus != BookingStatus.ACCEPTED && nextStatus != BookingStatus.DECLINED) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Choose ACCEPTED or DECLINED");
        }
        Booking booking = requireOwned(bookingId, providerId);
        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new BookingException(
                    HttpStatus.CONFLICT,
                    "Only a pending booking can be accepted or declined");
        }
        booking.setStatus(nextStatus);
        booking.setUnread(false);
        booking.setUpdatedAt(Instant.now());
        return toResponse(bookings.save(booking));
    }

    private Booking requireOwned(String bookingId, String providerId) {
        Booking booking = bookings.findById(bookingId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (providerId == null || !providerId.equals(booking.getProviderId())) {
            throw new BookingException(
                    HttpStatus.FORBIDDEN,
                    "This booking is assigned to another provider");
        }
        return booking;
    }

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