package com.clickcart.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.BookingResponse;
import com.clickcart.exception.BookingException;
import com.clickcart.service.BookingService;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingV1Controller {

    private final BookingService bookings;

    public BookingV1Controller(BookingService bookings) {
        this.bookings = bookings;
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approve(
            @RequestHeader(value = "X-Provider-Id", required = false) String providerId,
            @PathVariable String id) {
        providerId = com.clickcart.security.CurrentProvider.id();
        return ResponseEntity.ok(bookings.approve(id, providerId));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> reject(
            @RequestHeader(value = "X-Provider-Id", required = false) String providerId,
            @PathVariable String id) {
        providerId = com.clickcart.security.CurrentProvider.id();
        return ResponseEntity.ok(bookings.reject(id, providerId));
    }

    private void requireProvider(String providerId) {
        if (providerId == null || providerId.isBlank()) {
            throw new BookingException(HttpStatus.UNAUTHORIZED, "Provider identity is required");
        }
    }
}
