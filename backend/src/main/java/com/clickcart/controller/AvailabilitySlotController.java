package com.clickcart.controller;

import com.clickcart.dto.AvailabilitySlotResponse;
import com.clickcart.service.AvailabilitySlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/providers/{providerId}/availability/slots")
public class AvailabilitySlotController {

    private final AvailabilitySlotService availabilitySlotService;

    public AvailabilitySlotController(
            AvailabilitySlotService availabilitySlotService
    ) {
        this.availabilitySlotService = availabilitySlotService;
    }

    @GetMapping
    public ResponseEntity<List<AvailabilitySlotResponse>> getAvailability(
            @PathVariable String providerId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {

        List<AvailabilitySlotResponse> slots =
                availabilitySlotService.getAvailability(
                        providerId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(slots);
    }
}