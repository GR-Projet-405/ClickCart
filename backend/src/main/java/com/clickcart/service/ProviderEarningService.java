package com.clickcart.service;

import com.clickcart.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

public interface ProviderEarningService {

    EarningsSummaryResponse getEarningsSummary(String providerId, String period);

    List<MonthlyTrendDto> getMonthlyTrends(String providerId);

    List<CategoryBreakdownDto> getCategoryBreakdown(String providerId);

    Page<ProviderTransactionDto> getTransactions(String providerId, String search, String status,
                                                Instant startDate, Instant endDate, Pageable pageable);

    ProviderTransactionDto getTransactionById(String providerId, String transactionId);

    ProviderTransactionDto recordEarning(CreateEarningRequest request);

    PayoutResponse requestPayout(String providerId, PayoutRequest request);

    void seedInitialDataIfEmpty(String providerId);
}
