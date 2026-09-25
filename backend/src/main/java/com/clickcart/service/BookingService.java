package com.clickcart.service;

import com.clickcart.dto.BookingCreateDTO;
import com.clickcart.dto.BookingDTO;
import com.clickcart.dto.BookingSummaryDTO;

import java.util.List;

public interface BookingService {
    List<BookingDTO> getCustomerBookings(String customerId, String tab);
    BookingSummaryDTO getCustomerBookingSummary(String customerId);
    BookingDTO getBookingById(String id);
    BookingDTO createBooking(BookingCreateDTO createDTO);
    BookingDTO cancelBooking(String id, String reason);
}
