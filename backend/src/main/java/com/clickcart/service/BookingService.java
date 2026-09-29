package com.clickcart.service;

import java.util.List;

import com.clickcart.dto.BookingCreateDTO;
import com.clickcart.dto.BookingDTO;
import com.clickcart.dto.BookingResponse;
import com.clickcart.dto.BookingSummaryDTO;
import com.clickcart.dto.CreateBookingRequest;
import com.clickcart.model.BookingStatus;

public interface BookingService {

    // Core Customer Features
    List<BookingDTO> getCustomerBookings(String customerId, String tab);

    BookingSummaryDTO getCustomerBookingSummary(String customerId);

    BookingDTO getBookingById(String id);

    BookingDTO createBooking(BookingCreateDTO createDTO);

    BookingDTO cancelBooking(String id, String reason);

    // DEV-16: Booking Creation (New dev branch feature)
    BookingResponse createBooking(CreateBookingRequest request);

    // Provider Booking Management
    List<BookingResponse> listPending(String providerId, String sort);

    BookingResponse get(String bookingId, String providerId);

    BookingResponse decide(String bookingId, String providerId, BookingStatus nextStatus);
}