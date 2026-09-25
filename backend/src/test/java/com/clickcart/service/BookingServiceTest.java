package com.clickcart.service;

import com.clickcart.dto.BookingDTO;
import com.clickcart.dto.BookingSummaryDTO;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Booking;
import com.clickcart.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getCustomerBookings_upcoming_returnsUpcomingBookings() {
        Booking booking = new Booking();
        booking.setId("bk-1");
        booking.setCustomerId("cust_101");
        booking.setStatus("UPCOMING");
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
        when(bookingRepository.countByCustomerIdAndStatusIn(eq("cust_101"), eq(Arrays.asList("UPCOMING", "CONFIRMED"))))
                .thenReturn(2L);
        when(bookingRepository.countByCustomerIdAndStatusIn(eq("cust_101"), eq(Arrays.asList("ACTIVE", "IN_PROGRESS"))))
                .thenReturn(1L);
        when(bookingRepository.countByCustomerIdAndStatusIn(eq("cust_101"), eq(Arrays.asList("COMPLETED", "CANCELLED"))))
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
        booking.setStatus("UPCOMING");
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
}
