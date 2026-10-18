package com.clickcart.service;

import com.clickcart.dto.CreateEarningRequest;
import com.clickcart.dto.EarningsSummaryResponse;
import com.clickcart.dto.PayoutRequest;
import com.clickcart.dto.ProviderTransactionDto;
import com.clickcart.exception.BadRequestException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.model.EarningStatus;
import com.clickcart.model.ProviderEarning;
import com.clickcart.repository.ProviderEarningRepository;
import com.clickcart.service.impl.ProviderEarningServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProviderEarningServiceTest {

    @Mock
    private ProviderEarningRepository earningRepository;

    @InjectMocks
    private ProviderEarningServiceImpl earningService;

    private final String providerId = "provider-101";

    @Test
    @DisplayName("Should record earning with accurate snapshot commission and net amount (BR-07)")
    void shouldRecordEarningWithSnapshotCalculation() {
        CreateEarningRequest request = new CreateEarningRequest();
        request.setProviderId(providerId);
        request.setBookingId("BK-9999");
        request.setServiceTitle("Plumbing Repair");
        request.setCategory("Plumbing");
        request.setCustomerName("John Doe");
        request.setGrossAmount(new BigDecimal("10000.00"));
        request.setCommissionRate(new BigDecimal("0.10")); // 10%

        when(earningRepository.save(any(ProviderEarning.class))).thenAnswer(invocation -> {
            ProviderEarning saved = invocation.getArgument(0);
            saved.setId("earning-123");
            return saved;
        });

        ProviderTransactionDto result = earningService.recordEarning(request);

        assertNotNull(result);
        assertEquals(new BigDecimal("10000.00"), result.getGrossAmount());
        assertEquals(new BigDecimal("1000.00"), result.getCommissionAmount()); // 10% of 10000
        assertEquals(new BigDecimal("9000.00"), result.getNetAmount());        // 10000 - 1000
        assertEquals(EarningStatus.AVAILABLE, result.getStatus());
        verify(earningRepository, times(1)).save(any(ProviderEarning.class));
    }

    @Test
    @DisplayName("Should correctly aggregate summary metrics for dashboard")
    void shouldAggregateSummaryMetrics() {
        ProviderEarning availableEarning = new ProviderEarning(
                providerId, "BK-1", "TXN-1", "Service A", "Cleaning", "Customer A",
                new BigDecimal("10000.00"), new BigDecimal("0.10"), new BigDecimal("1000.00"),
                new BigDecimal("9000.00"), "LKR", EarningStatus.AVAILABLE, Instant.now()
        );

        ProviderEarning pendingEarning = new ProviderEarning(
                providerId, "BK-2", "TXN-2", "Service B", "Electrical", "Customer B",
                new BigDecimal("5000.00"), new BigDecimal("0.10"), new BigDecimal("500.00"),
                new BigDecimal("4500.00"), "LKR", EarningStatus.PENDING, Instant.now()
        );

        when(earningRepository.countByProviderIdAndStatus(eq(providerId), any(EarningStatus.class))).thenReturn(2L);
        when(earningRepository.findByProviderId(providerId)).thenReturn(List.of(availableEarning, pendingEarning));

        EarningsSummaryResponse summary = earningService.getEarningsSummary(providerId, "30days");

        assertNotNull(summary);
        assertEquals(new BigDecimal("15000.00"), summary.getTotalGrossRevenue());
        assertEquals(new BigDecimal("1500.00"), summary.getTotalCommissionDeducted());
        assertEquals(new BigDecimal("9000.00"), summary.getNetAvailableBalance());
        assertEquals(new BigDecimal("4500.00"), summary.getPendingClearance());
        assertEquals(1L, summary.getActivePendingBookingsCount());
    }

    @Test
    @DisplayName("BE-035: Should throw BadRequestException when unsupported earnings period is provided")
    void shouldThrowBadRequestForInvalidPeriod() {
        assertThrows(BadRequestException.class, () ->
                earningService.getEarningsSummary(providerId, "unsupported-period-123"));
    }

    @Test
    @DisplayName("BE-036: Should filter transactions within valid startDate and endDate range")
    void shouldFilterTransactionsByValidDateRange() {
        Instant now = Instant.now();
        ProviderEarning recent = new ProviderEarning(
                providerId, "BK-10", "TXN-10", "AC Service", "Electrical", "Alice",
                new BigDecimal("8000.00"), new BigDecimal("0.10"), new BigDecimal("800.00"),
                new BigDecimal("7200.00"), "LKR", EarningStatus.AVAILABLE, now
        );
        recent.setCreatedAt(now.minus(2, ChronoUnit.DAYS));

        ProviderEarning old = new ProviderEarning(
                providerId, "BK-11", "TXN-11", "Old Service", "Cleaning", "Bob",
                new BigDecimal("5000.00"), new BigDecimal("0.10"), new BigDecimal("500.00"),
                new BigDecimal("4500.00"), "LKR", EarningStatus.SETTLED, now.minus(40, ChronoUnit.DAYS)
        );
        old.setCreatedAt(now.minus(40, ChronoUnit.DAYS));

        when(earningRepository.countByProviderIdAndStatus(eq(providerId), any(EarningStatus.class))).thenReturn(2L);
        when(earningRepository.findByProviderId(providerId)).thenReturn(List.of(recent, old));

        Instant start = now.minus(5, ChronoUnit.DAYS);
        Instant end = now;

        Page<ProviderTransactionDto> result = earningService.getTransactions(
                providerId, null, null, start, end, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("TXN-10", result.getContent().get(0).getTransactionId());
    }

    @Test
    @DisplayName("BE-037: Should throw BadRequestException when endDate is earlier than startDate")
    void shouldThrowBadRequestForReversedDateRange() {
        Instant start = Instant.now();
        Instant end = start.minus(5, ChronoUnit.DAYS);

        assertThrows(BadRequestException.class, () ->
                earningService.getTransactions(providerId, null, null, start, end, PageRequest.of(0, 10)));
    }

    @Test
    @DisplayName("BE-038: Should throw BadRequestException if payout request exceeds net available balance")
    void shouldRejectPayoutIfExceedsBalance() {
        when(earningRepository.countByProviderIdAndStatus(eq(providerId), any(EarningStatus.class))).thenReturn(1L);
        when(earningRepository.findByProviderId(providerId)).thenReturn(List.of());

        PayoutRequest request = new PayoutRequest();
        request.setAmount(new BigDecimal("50000.00")); // Balance is 0
        request.setBankName("BOC");
        request.setAccountNumber("12345678");

        assertThrows(BadRequestException.class, () -> earningService.requestPayout(providerId, request));
    }

    @Test
    @DisplayName("BE-039: Should throw ForbiddenException when accessing another provider's transaction")
    void shouldThrowForbiddenWhenAccessingAnotherProviderTransaction() {
        ProviderEarning earning = new ProviderEarning(
                "other-provider", "BK-99", "TXN-99", "Service", "Plumbing", "Cust",
                new BigDecimal("5000.00"), new BigDecimal("0.10"), new BigDecimal("500.00"),
                new BigDecimal("4500.00"), "LKR", EarningStatus.AVAILABLE, Instant.now()
        );

        when(earningRepository.findByTransactionId("TXN-99")).thenReturn(Optional.of(earning));

        assertThrows(ForbiddenException.class, () ->
                earningService.getTransactionById(providerId, "TXN-99"));
    }
}
