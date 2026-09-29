package com.clickcart.service;

import com.clickcart.dto.CreateEarningRequest;
import com.clickcart.dto.EarningsSummaryResponse;
import com.clickcart.dto.PayoutRequest;
import com.clickcart.dto.ProviderTransactionDto;
import com.clickcart.exception.BadRequestException;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

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
    @DisplayName("Should throw BadRequestException if payout request exceeds net available balance")
    void shouldRejectPayoutIfExceedsBalance() {
        when(earningRepository.countByProviderIdAndStatus(eq(providerId), any(EarningStatus.class))).thenReturn(1L);
        when(earningRepository.findByProviderId(providerId)).thenReturn(List.of());

        PayoutRequest request = new PayoutRequest();
        request.setAmount(new BigDecimal("50000.00")); // Balance is 0
        request.setBankName("BOC");
        request.setAccountNumber("12345678");

        assertThrows(BadRequestException.class, () -> earningService.requestPayout(providerId, request));
    }
}
