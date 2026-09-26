package com.clickcart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.BookingDecisionRequest;
import com.clickcart.dto.BookingResponse;
import com.clickcart.exception.BookingException;
import com.clickcart.model.BookingStatus;
import com.clickcart.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/provider/bookings")
public class ProviderBookingController {

    private final BookingService bookings;

    public ProviderBookingController(BookingService bookings) {
        this.bookings = bookings;
    }

    @GetMapping
    public List<BookingResponse> list(
            @RequestHeader(value = "X-Provider-Id", required = false) String providerId,
            @RequestParam(defaultValue = "PENDING_APPROVAL") BookingStatus status,
            @RequestParam(required = false) String sort) {
        requireProvider(providerId);
        if (status != BookingStatus.PENDING_APPROVAL) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Only pending bookings can be listed here");
        }
        return bookings.listPending(providerId, sort);
    }

    @GetMapping("/{id}")
    public BookingResponse get(
            @RequestHeader(value = "X-Provider-Id", required = false) String providerId,
            @PathVariable String id) {
        requireProvider(providerId);
        return bookings.get(id, providerId);
    }

    @PatchMapping("/{id}")
    public BookingResponse decide(
            @RequestHeader(value = "X-Provider-Id", required = false) String providerId,
            @PathVariable String id,
            @Valid @RequestBody BookingDecisionRequest request) {
        requireProvider(providerId);
        return bookings.decide(id, providerId, request.getStatus());
    }

    private void requireProvider(String providerId) {
        if (providerId == null || providerId.isBlank()) {
            throw new BookingException(HttpStatus.UNAUTHORIZED, "Provider identity is required");
        }
    }
}