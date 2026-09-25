package com.clickcart.controller;

import com.clickcart.dto.*;
import com.clickcart.service.ProviderEarningService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST controller for Service Provider Earnings and Financial Operations.
 * DEV-28 | Pasan Kalhara
 */
@RestController
@RequestMapping("/api/provider/earnings")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProviderEarningController {

    private final ProviderEarningService earningService;

    public ProviderEarningController(ProviderEarningService earningService) {
        this.earningService = earningService;
    }

    @GetMapping("/summary")
    public ResponseEntity<EarningsSummaryResponse> getEarningsSummary(
            @RequestParam(defaultValue = "provider-101") String providerId,
            @RequestParam(defaultValue = "30days") String period) {
        return ResponseEntity.ok(earningService.getEarningsSummary(providerId, period));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrends(
            @RequestParam(defaultValue = "provider-101") String providerId) {
        return ResponseEntity.ok(earningService.getMonthlyTrends(providerId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryBreakdownDto>> getCategoryBreakdown(
            @RequestParam(defaultValue = "provider-101") String providerId) {
        return ResponseEntity.ok(earningService.getCategoryBreakdown(providerId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<ProviderTransactionDto>> getTransactions(
            @RequestParam(defaultValue = "provider-101") String providerId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(earningService.getTransactions(
                providerId, search, status, startDate, endDate, PageRequest.of(page, size)));
    }

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<ProviderTransactionDto> getTransactionById(
            @PathVariable String transactionId,
            @RequestParam(defaultValue = "provider-101") String providerId) {
        return ResponseEntity.ok(earningService.getTransactionById(providerId, transactionId));
    }

    @PostMapping("/payout")
    public ResponseEntity<PayoutResponse> requestPayout(
            @RequestParam(defaultValue = "provider-101") String providerId,
            @Valid @RequestBody PayoutRequest request) {
        PayoutResponse response = earningService.requestPayout(providerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/record")
    public ResponseEntity<ProviderTransactionDto> recordEarning(
            @Valid @RequestBody CreateEarningRequest request) {
        ProviderTransactionDto created = earningService.recordEarning(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
