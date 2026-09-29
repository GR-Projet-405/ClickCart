package com.clickcart.controller;

import com.clickcart.dto.BlockedDateRequest;
import com.clickcart.dto.BlockedDateResponse;
import com.clickcart.service.BlockedDateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers/{providerId}/blocked-dates")
public class BlockedDateController {

    private final BlockedDateService blockedDateService;

    public BlockedDateController(BlockedDateService blockedDateService) {
        this.blockedDateService = blockedDateService;
    }

    @PostMapping
    public ResponseEntity<BlockedDateResponse> createBlockedDate(
            @PathVariable String providerId,
            @Valid @RequestBody BlockedDateRequest request) {

        request.setProviderId(providerId);

        BlockedDateResponse response =
                blockedDateService.createBlockedDate(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<BlockedDateResponse>> getBlockedDates(
            @PathVariable String providerId) {

        return ResponseEntity.ok(
                blockedDateService.getBlockedDatesByProvider(providerId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlockedDateResponse> updateBlockedDate(
            @PathVariable String providerId,
            @PathVariable String id,
            @Valid @RequestBody BlockedDateRequest request) {

        request.setProviderId(providerId);

        BlockedDateResponse response =
                blockedDateService.updateBlockedDate(id, request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlockedDate(
            @PathVariable String providerId,
            @PathVariable String id) {

        blockedDateService.deleteBlockedDate(id);

        return ResponseEntity.noContent().build();
    }
}