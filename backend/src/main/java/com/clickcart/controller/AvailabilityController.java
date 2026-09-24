package com.clickcart.controller;

import com.clickcart.dto.AvailabilityRuleRequest;
import com.clickcart.dto.AvailabilityRuleResponse;
import com.clickcart.service.AvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers/{providerId}/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping
    public ResponseEntity<AvailabilityRuleResponse> createRule(
            @PathVariable String providerId,
            @Valid @RequestBody AvailabilityRuleRequest request
    ) {
        request.setProviderId(providerId);

        AvailabilityRuleResponse response =
                availabilityService.createRule(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<AvailabilityRuleResponse>> getRules(
            @PathVariable String providerId
    ) {
        return ResponseEntity.ok(
                availabilityService.getRulesByProvider(providerId)
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<AvailabilityRuleResponse>> getActiveRules(
            @PathVariable String providerId
    ) {
        return ResponseEntity.ok(
                availabilityService.getActiveRulesByProvider(providerId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvailabilityRuleResponse> updateRule(
            @PathVariable String providerId,
            @PathVariable String id,
            @Valid @RequestBody AvailabilityRuleRequest request
    ) {
        request.setProviderId(providerId);

        AvailabilityRuleResponse response =
                availabilityService.updateRule(id, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable String providerId,
            @PathVariable String id
    ) {
        availabilityService.deleteRule(id);

        return ResponseEntity.noContent().build();
    }
}