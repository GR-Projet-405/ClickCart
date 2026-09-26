package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.clickcart.exception.BookingException;
import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;
import com.clickcart.repository.BookingRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookings;

    private BookingService service;

    @BeforeEach
    void setUp() {
        service = new BookingService(bookings);
    }

    @Test
    void acceptMovesAPendingBookingToAccepted() {
        when(bookings.findById("bk-1")).thenReturn(Optional.of(pendingBooking()));
        when(bookings.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.decide("bk-1", "provider-1", BookingStatus.ACCEPTED);

        assertEquals(BookingStatus.ACCEPTED, response.getStatus());
        verify(bookings).save(any(Booking.class));
    }

    @Test
    void secondDecisionConflicts() {
        Booking booking = pendingBooking();
        booking.setStatus(BookingStatus.ACCEPTED);
        when(bookings.findById("bk-1")).thenReturn(Optional.of(booking));

        BookingException error = assertThrows(
                BookingException.class,
                () -> service.decide("bk-1", "provider-1", BookingStatus.DECLINED));

        assertEquals(HttpStatus.CONFLICT, error.getStatus());
    }

    @Test
    void anotherProviderIsForbidden() {
        when(bookings.findById("bk-1")).thenReturn(Optional.of(pendingBooking()));

        BookingException error = assertThrows(
                BookingException.class,
                () -> service.decide("bk-1", "provider-2", BookingStatus.ACCEPTED));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatus());
    }

    @Test
    void missingBookingIsNotFound() {
        when(bookings.findById("missing")).thenReturn(Optional.empty());

        BookingException error = assertThrows(
                BookingException.class,
                () -> service.decide("missing", "provider-1", BookingStatus.ACCEPTED));

        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
    }

    private static Booking pendingBooking() {
        Booking booking = new Booking();
        booking.setId("bk-1");
        booking.setProviderId("provider-1");
        booking.setServiceName("House Cleaning");
        booking.setCustomerName("Gihani Perera");
        booking.setCity("Colombo 05");
        booking.setCountry("Sri Lanka");
        booking.setScheduledAt(Instant.parse("2024-03-20T03:30:00Z"));
        booking.setTimeSlot("09:00-11:00");
        booking.setEstimatedPay(new BigDecimal("4500"));
        booking.setCurrency("LKR");
        booking.setNotes("Please bring eco-friendly cleaning agents.");
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
        booking.setUnread(true);
        booking.setCreatedAt(Instant.parse("2024-03-19T08:00:00Z"));
        return booking;
    }
}