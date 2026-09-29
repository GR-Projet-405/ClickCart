package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.clickcart.dto.BookingDTO;
import com.clickcart.dto.BookingSummaryDTO;
import com.clickcart.exception.BookingException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;
import com.clickcart.repository.BookingRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void getCustomerBookings_upcoming_returnsUpcomingBookings() {
        Booking booking = new Booking();
        booking.setId("bk-1");
        booking.setCustomerId("cust_101");
        booking.setStatus(BookingStatus.UPCOMING);
        booking.setStatusLabel("Confirmed");

        when(bookingRepository.findByCustomerIdAndStatusIn(eq("cust_101"), any()))
                .thenReturn(Arrays.asList(booking));

        List<BookingDTO> result = bookingService.getCustomerBookings("cust_101", "upcoming");

        assertEquals(1, result.size());
        assertEquals("bk-1", result.get(0).getId());
        assertEquals("Confirmed", result.get(0).getStatusLabel());
    }

    @Test
    void getCustomerBookingSummary_returnsCorrectCounts() {
        when(bookingRepository.countByCustomerIdAndStatusIn(eq("cust_101"), eq(Arrays.asList(BookingStatus.UPCOMING, BookingStatus.CONFIRMED))))
                .thenReturn(2L);
        when(bookingRepository.countByCustomerIdAndStatusIn(eq("cust_101"), eq(Arrays.asList(BookingStatus.ACTIVE, BookingStatus.IN_PROGRESS))))
                .thenReturn(1L);
        when(bookingRepository.countByCustomerIdAndStatusIn(eq("cust_101"), eq(Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED))))
                .thenReturn(3L);

        BookingSummaryDTO summary = bookingService.getCustomerBookingSummary("cust_101");

        assertEquals(2L, summary.getUpcomingCount());
        assertEquals(1L, summary.getActiveCount());
        assertEquals(3L, summary.getHistoryCount());
        assertEquals(6L, summary.getTotalCount());
    }

    @Test
    void cancelBooking_existingId_updatesStatusToCancelled() {
        Booking booking = new Booking();
        booking.setId("bk-101");
        booking.setStatus(BookingStatus.UPCOMING);
        booking.setStatusLabel("Confirmed");

        when(bookingRepository.findById("bk-101")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingDTO result = bookingService.cancelBooking("bk-101", "Need to reschedule");

        assertEquals("CANCELLED", result.getStatus());
        assertEquals("Cancelled", result.getStatusLabel());
        assertTrue(result.getNotes().contains("Cancellation reason: Need to reschedule"));
    }

    @Test
    void getBookingById_notFound_throwsResourceNotFoundException() {
        when(bookingRepository.findById("invalid-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.getBookingById("invalid-id"));
    }

    @Test
    void acceptMovesAPendingBookingToAccepted() {
        when(bookingRepository.findById("bk-1")).thenReturn(Optional.of(pendingBooking()));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = bookingService.decide("bk-1", "provider-1", BookingStatus.ACCEPTED);

        assertEquals(BookingStatus.ACCEPTED, response.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void secondDecisionConflicts() {
        Booking booking = pendingBooking();
        booking.setStatus(BookingStatus.ACCEPTED);
        when(bookingRepository.findById("bk-1")).thenReturn(Optional.of(booking));

        BookingException error = assertThrows(
                BookingException.class,
                () -> bookingService.decide("bk-1", "provider-1", BookingStatus.DECLINED));

        assertEquals(HttpStatus.CONFLICT, error.getStatus());
    }

    @Test
    void anotherProviderIsForbidden() {
        when(bookingRepository.findById("bk-1")).thenReturn(Optional.of(pendingBooking()));

        BookingException error = assertThrows(
                BookingException.class,
                () -> bookingService.decide("bk-1", "provider-2", BookingStatus.ACCEPTED));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatus());
    }

    @Test
    void missingBookingIsNotFound() {
        when(bookingRepository.findById("missing")).thenReturn(Optional.empty());

        BookingException error = assertThrows(
                BookingException.class,
                () -> bookingService.decide("missing", "provider-1", BookingStatus.ACCEPTED));

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
