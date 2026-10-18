package com.clickcart.controller;

import com.clickcart.dto.EarningsSummaryResponse;
import com.clickcart.dto.PayoutRequest;
import com.clickcart.dto.PayoutResponse;
import com.clickcart.dto.ProviderTransactionDto;
import com.clickcart.exception.BadRequestException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.GlobalExceptionHandler;
import com.clickcart.model.EarningStatus;
import com.clickcart.service.ProviderEarningService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProviderEarningController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ProviderEarningControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProviderEarningService earningService;

    @Test
    @DisplayName("BE-035: Invalid earnings period should return 400 Bad Request")
    void shouldReturn400ForInvalidPeriod() throws Exception {
        when(earningService.getEarningsSummary(anyString(), eq("unsupported")))
                .thenThrow(new BadRequestException("Unsupported earnings period: 'unsupported'"));

        mockMvc.perform(get("/api/provider/earnings/summary")
                        .param("period", "unsupported"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("BE-036: Valid transaction date range should return 200 OK")
    void shouldReturn200ForValidDateRange() throws Exception {
        ProviderTransactionDto dto = new ProviderTransactionDto(
                "earning-1", "provider-101", "BK-1", "TXN-1", "AC Repair", "Electrical", "John",
                new BigDecimal("10000.00"), new BigDecimal("0.10"), new BigDecimal("1000.00"),
                new BigDecimal("9000.00"), "LKR", EarningStatus.AVAILABLE, null, Instant.now(), Instant.now()
        );

        when(earningService.getTransactions(anyString(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/provider/earnings/transactions")
                        .param("startDate", "2026-05-01")
                        .param("endDate", "2026-05-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].transactionId").value("TXN-1"));
    }

    @Test
    @DisplayName("BE-037: Reversed transaction date range should return 400 Bad Request")
    void shouldReturn400ForReversedDateRange() throws Exception {
        mockMvc.perform(get("/api/provider/earnings/transactions")
                        .param("startDate", "2026-05-31")
                        .param("endDate", "2026-05-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("BE-038: Payout above available balance should return 400 Bad Request")
    void shouldReturn400ForPayoutAboveBalance() throws Exception {
        when(earningService.requestPayout(anyString(), any(PayoutRequest.class)))
                .thenThrow(new BadRequestException("Requested amount exceeds net available balance of LKR 1000.00"));

        PayoutRequest request = new PayoutRequest();
        request.setAmount(new BigDecimal("50000.00"));
        request.setBankName("BOC");
        request.setAccountNumber("12345678");

        mockMvc.perform(post("/api/provider/earnings/payout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Requested amount exceeds net available balance of LKR 1000.00"));
    }

    @Test
    @DisplayName("BE-039: Accessing another provider's earnings by ID should return 403 Forbidden")
    @WithMockUser(username = "provider-101", roles = {"SERVICE_PROVIDER"})
    void shouldReturn403ForAccessingAnotherProviderEarnings() throws Exception {
        mockMvc.perform(get("/api/provider/earnings/summary")
                        .param("providerId", "provider-999"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("BE-040: Customer token accessing earnings should return 403 Forbidden")
    @WithMockUser(username = "customer-01", roles = {"CUSTOMER"})
    void shouldReturn403ForCustomerRole() throws Exception {
        mockMvc.perform(get("/api/provider/earnings/summary"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }
}
