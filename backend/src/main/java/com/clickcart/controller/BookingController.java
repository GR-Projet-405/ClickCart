package com.clickcart.controller;

import com.clickcart.dto.BookingCreateDTO;
import com.clickcart.dto.BookingDTO;
import com.clickcart.dto.BookingSummaryDTO;
import com.clickcart.dto.CancelBookingRequestDTO;
import com.clickcart.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    // Standard Constructor Injection (Best Practice)
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingDTO>> getCustomerBookings(
            @PathVariable String customerId,
            @RequestParam(required = false, defaultValue = "upcoming") String tab) {
        List<BookingDTO> bookings = bookingService.getCustomerBookings(customerId, tab);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/customer/{customerId}/summary")
    public ResponseEntity<BookingSummaryDTO> getCustomerBookingSummary(@PathVariable String customerId) {
        BookingSummaryDTO summary = bookingService.getCustomerBookingSummary(customerId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable String id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingCreateDTO createDTO) {
        BookingDTO created = bookingService.createBooking(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable String id,
            @RequestBody(required = false) CancelBookingRequestDTO request) {
        String reason = request != null ? request.getReason() : null;
        BookingDTO cancelled = bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(cancelled);
    }

    // Integrated from dev branch
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBusinessValidationError(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }
}