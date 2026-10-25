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
public class BookingController {

    private final BookingService bookingService;
    @org.springframework.beans.factory.annotation.Autowired private com.clickcart.util.CurrentCustomerResolver currentCustomer;
    private String ownCustomer() {
        var auth=org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if(auth==null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) throw new com.clickcart.exception.UnauthorizedException("Sign in to continue");
        if(auth.getAuthorities().stream().noneMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()))) throw new com.clickcart.exception.ForbiddenException("Customer access required");
        return currentCustomer.getCurrentCustomerId();
    }
    private void requireOwner(BookingDTO booking) { if(!ownCustomer().equals(booking.getCustomerId())) throw new com.clickcart.exception.ForbiddenException("This booking belongs to another account"); }


    // Standard Constructor Injection (Best Practice)
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingDTO>> getCustomerBookings(
            @PathVariable String customerId,
            @RequestParam(required = false, defaultValue = "upcoming") String tab) {
        List<BookingDTO> bookings = bookingService.getCustomerBookings(ownCustomer(), tab);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/customer/{customerId}/summary")
    public ResponseEntity<BookingSummaryDTO> getCustomerBookingSummary(@PathVariable String customerId) {
        BookingSummaryDTO summary = bookingService.getCustomerBookingSummary(ownCustomer());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable String id) {
        BookingDTO booking = bookingService.getBookingById(id);
        requireOwner(booking);
        return ResponseEntity.ok(booking);
    }

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingCreateDTO createDTO) {
        createDTO.setCustomerId(ownCustomer());
        BookingDTO created = bookingService.createBooking(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable String id,
            @RequestBody(required = false) CancelBookingRequestDTO request) {
        requireOwner(bookingService.getBookingById(id));
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