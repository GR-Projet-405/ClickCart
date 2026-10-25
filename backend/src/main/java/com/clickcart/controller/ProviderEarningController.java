package com.clickcart.controller;

import com.clickcart.dto.*;
import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.exception.BadRequestException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.model.Role;
import com.clickcart.service.ProviderEarningService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * REST controller for Service Provider Earnings and Financial Operations.
 * DEV-28 | Pasan Kalhara
 */
@RestController
@RequestMapping("/api/provider/earnings")
public class ProviderEarningController {

    private final ProviderEarningService earningService;

    @Value("${clickcart.security.enabled:false}")
    private boolean securityEnabled;

    public ProviderEarningController(ProviderEarningService earningService) {
        this.earningService = earningService;
    }

    /**
     * Validates that the caller is authenticated as a SERVICE_PROVIDER (or PLATFORM_ADMIN)
     * and owns the requested provider account.
     * Enforces BE-039 (ownership check) and BE-040 (role check).
     */
    private String resolveAndValidateProviderId(String requestedProviderId, Authentication authentication) {
        String providerId = com.clickcart.security.CurrentProvider.id(authentication);
        if (requestedProviderId != null && !requestedProviderId.isBlank() && !providerId.equals(requestedProviderId)) {
            throw new ForbiddenException("You can only access your own earnings");
        }
        return providerId;
    }

    /**
     * Parses dates flexibly: supports ISO-8601 Instant, OffsetDateTime, LocalDateTime, LocalDate (YYYY-MM-DD), and Epoch millis.
     * Enforces BE-036.
     */
    public static Instant parseDate(String dateStr, boolean isEndOfDay) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        String trimmed = dateStr.trim();
        // 1. Try Instant ISO-8601 (e.g. 2026-05-01T00:00:00Z)
        try {
            return Instant.parse(trimmed);
        } catch (DateTimeParseException ignored) {}

        // 2. Try OffsetDateTime (e.g. 2026-05-01T00:00:00+05:30)
        try {
            return OffsetDateTime.parse(trimmed).toInstant();
        } catch (DateTimeParseException ignored) {}

        // 3. Try LocalDateTime (e.g. 2026-05-01T00:00:00)
        try {
            return LocalDateTime.parse(trimmed).atZone(ZoneOffset.UTC).toInstant();
        } catch (DateTimeParseException ignored) {}

        // 4. Try LocalDate (e.g. 2026-05-01)
        try {
            LocalDate date = LocalDate.parse(trimmed);
            if (isEndOfDay) {
                return date.atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant();
            } else {
                return date.atStartOfDay(ZoneOffset.UTC).toInstant();
            }
        } catch (DateTimeParseException ignored) {}

        // 5. Try Epoch Milliseconds
        try {
            long epoch = Long.parseLong(trimmed);
            return Instant.ofEpochMilli(epoch);
        } catch (NumberFormatException ignored) {}

        throw new BadRequestException("Invalid date format: '" + dateStr + "'. Expected format is YYYY-MM-DD or ISO-8601 DateTime.");
    }

    @GetMapping("/summary")
    public ResponseEntity<EarningsSummaryResponse> getEarningsSummary(
            @RequestParam(required = false) String providerId,
            @RequestParam(required = false, defaultValue = "30days") String period,
            Authentication authentication) {
        String resolvedId = resolveAndValidateProviderId(providerId, authentication);
        return ResponseEntity.ok(earningService.getEarningsSummary(resolvedId, period));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrends(
            @RequestParam(required = false) String providerId,
            Authentication authentication) {
        String resolvedId = resolveAndValidateProviderId(providerId, authentication);
        return ResponseEntity.ok(earningService.getMonthlyTrends(resolvedId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryBreakdownDto>> getCategoryBreakdown(
            @RequestParam(required = false) String providerId,
            Authentication authentication) {
        String resolvedId = resolveAndValidateProviderId(providerId, authentication);
        return ResponseEntity.ok(earningService.getCategoryBreakdown(resolvedId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<ProviderTransactionDto>> getTransactions(
            @RequestParam(required = false) String providerId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String resolvedId = resolveAndValidateProviderId(providerId, authentication);
        Instant parsedStart = parseDate(startDate, false);
        Instant parsedEnd = parseDate(endDate, true);

        // BE-037: Validate date order
        if (parsedStart != null && parsedEnd != null && parsedEnd.isBefore(parsedStart)) {
            throw new BadRequestException("Invalid date range: endDate (" + endDate + ") cannot be earlier than startDate (" + startDate + ")");
        }

        return ResponseEntity.ok(earningService.getTransactions(
                resolvedId, search, status, parsedStart, parsedEnd, PageRequest.of(page, size)));
    }

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<ProviderTransactionDto> getTransactionById(
            @PathVariable String transactionId,
            @RequestParam(required = false) String providerId,
            Authentication authentication) {
        String resolvedId = resolveAndValidateProviderId(providerId, authentication);
        return ResponseEntity.ok(earningService.getTransactionById(resolvedId, transactionId));
    }

    @PostMapping("/payout")
    public ResponseEntity<PayoutResponse> requestPayout(
            @RequestParam(required = false) String providerId,
            @Valid @RequestBody PayoutRequest request,
            Authentication authentication) {
        String resolvedId = resolveAndValidateProviderId(providerId, authentication);
        PayoutResponse response = earningService.requestPayout(resolvedId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/record")
    public ResponseEntity<ProviderTransactionDto> recordEarning(
            @Valid @RequestBody CreateEarningRequest request,
            Authentication authentication) {
        throw new com.clickcart.exception.ForbiddenException("Earnings are recorded from reviewed commission transactions, not provider-entered balances");
    }
}
