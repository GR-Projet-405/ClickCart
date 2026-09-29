package com.clickcart.service;

import com.clickcart.controller.CommissionDashboardController;
import com.clickcart.model.CommissionRule;
import com.clickcart.model.CommissionTransaction;
import com.clickcart.repository.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CommissionSplitSaveTest {
    @Test
    void paidToggleAdjustsPendingTotalsAndRequiresCorrectId() {
        var transactions = mock(CommissionTransactionRepository.class);
        var rules = mock(CommissionRuleRepository.class);
        var snapshots = mock(CommissionSnapshotRepository.class);
        var audit = mock(CommissionAuditLogRepository.class);
        var service = new CommissionTransactionService(transactions, snapshots, null, null);
        var entry = new CommissionTransaction("internal-id", null, null, "Cleaning", new BigDecimal("18000"),
                "Cleaning", new BigDecimal("900"), new BigDecimal("17100"), Instant.now(),
                CommissionTransaction.TransactionStatus.PENDING, null, "LI140");
        when(transactions.findById("internal-id")).thenReturn(Optional.of(entry));
        when(transactions.save(any())).thenAnswer(call -> call.getArgument(0));
        assertThatThrownBy(() -> service.setPaid("internal-id", true, "WRONG")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.delete("internal-id", "WRONG")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.update("internal-id", new CommissionTransactionService.SplitUpdateRequest(BigDecimal.TEN, "Cleaning"), "WRONG"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(transactions, never()).save(any());
        verify(transactions, never()).delete(any());
        var paid = service.setPaid("internal-id", true, "LI140");
        assertThat(paid.status()).isEqualTo(CommissionTransaction.TransactionStatus.SETTLED);
        assertThat(paid.commissionAmount()).isEqualByComparingTo("900");
        var controller = new CommissionDashboardController(rules, transactions, snapshots, audit, service);
        when(transactions.findAll()).thenReturn(List.of(paid));
        assertThat((BigDecimal) controller.dashboard().get("totalRevenue")).isEqualByComparingTo("900");
        assertThat((BigDecimal) controller.dashboard().get("pendingCommissionRevenue")).isEqualByComparingTo("0");
        assertThat((BigDecimal) controller.dashboard().get("totalSettlements")).isEqualByComparingTo("17100");
        assertThat((BigDecimal) controller.dashboard().get("settledAmount")).isEqualByComparingTo("17100");
        when(transactions.findById("internal-id")).thenReturn(Optional.of(paid));
        var unpaid = service.setPaid("internal-id", false, "LI140");
        assertThat(unpaid.status()).isEqualTo(CommissionTransaction.TransactionStatus.PENDING);
        when(transactions.findAll()).thenReturn(List.of(unpaid));
        assertThat((BigDecimal) controller.dashboard().get("totalSettlements")).isEqualByComparingTo("17100");
        assertThat((BigDecimal) controller.dashboard().get("settledAmount")).isEqualByComparingTo("0");
        assertThat((BigDecimal) controller.dashboard().get("totalRevenue")).isEqualByComparingTo("0");
        assertThat((BigDecimal) controller.dashboard().get("pendingCommissionRevenue")).isEqualByComparingTo("900");
    }

    @Test
    void assignsShortPublicIdsToLegacyRecordsWithoutChangingTheirKeys() {
        var transactions = mock(CommissionTransactionRepository.class);
        var service = new CommissionTransactionService(transactions, null, null, null);
        var legacy = new CommissionTransaction("3e639776-4388-448d-82a0-4fdbc5f9c7be", null, null,
                "Cleaning", BigDecimal.TEN, "Cleaning", BigDecimal.ONE, new BigDecimal("9"),
                Instant.now(), CommissionTransaction.TransactionStatus.PENDING, null);
        when(transactions.findAll()).thenReturn(List.of(legacy));
        service.listWithPublicIds();
        var id = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(transactions).assignPublicId(eq(legacy.transactionId()), id.capture());
        assertThat(id.getValue()).matches("[A-Z]{2}[0-9]{3}");
        verify(transactions, never()).save(any());
        verify(transactions, never()).delete(any());
    }

    @Test
    void savesCategorySplitAndIncludesItInOverallTotals() {
        var transactions = mock(CommissionTransactionRepository.class);
        var snapshots = mock(CommissionSnapshotRepository.class);
        var rules = mock(CommissionRuleRepository.class);
        var audit = mock(CommissionAuditLogRepository.class);
        var calculator = new CommissionCalculatorService();
        var ruleService = new CommissionRuleService(rules, snapshots, calculator, audit);
        var service = new CommissionTransactionService(transactions, snapshots, ruleService, calculator);
        var rule = new CommissionRule("Cleaning", "", "Cleaning", CommissionRule.CommissionType.PERCENTAGE,
                new BigDecimal("5"), BigDecimal.ZERO, null, BigDecimal.ZERO, CommissionRule.ProviderTier.ALL,
                0, CommissionRule.RuleStatus.ACTIVE, Instant.now().minusSeconds(60), null, "admin");
        when(rules.findAllByOrderByPriorityDescEffectiveStartDateDesc()).thenReturn(List.of(rule));
        when(transactions.findById("split-1")).thenReturn(Optional.empty());
        when(snapshots.save(any())).thenAnswer(call -> call.getArgument(0));
        when(transactions.save(any())).thenAnswer(call -> call.getArgument(0));
        var saved = service.create(new CommissionTransactionService.TransactionRequest("split-1", null, null,
                "Cleaning", new BigDecimal("10000"), "Cleaning", null));
        assertThat(saved.commissionAmount()).isEqualByComparingTo("500");
        assertThat(saved.providerEarning()).isEqualByComparingTo("9500");
        assertThat(saved.status()).isEqualTo(CommissionTransaction.TransactionStatus.PENDING);
        when(transactions.findById("split-1")).thenReturn(Optional.of(saved));
        service.create(new CommissionTransactionService.TransactionRequest("split-1", null, null,
                "Cleaning", new BigDecimal("10000"), "Cleaning", null));
        verify(transactions, times(1)).save(any());
        var settled = new CommissionTransaction("settled", null, null, "Cleaning", new BigDecimal("5000"),
                "Cleaning", new BigDecimal("1000"), new BigDecimal("4000"), Instant.now(),
                CommissionTransaction.TransactionStatus.SETTLED, null);
        when(transactions.findAll()).thenReturn(List.of(saved, settled));
        when(rules.findAll()).thenReturn(List.of(rule));
        var totals = new CommissionDashboardController(rules, transactions, snapshots, audit, service).dashboard();
        assertThat((BigDecimal) totals.get("totalRevenue")).isEqualByComparingTo("1000");
        assertThat((BigDecimal) totals.get("pendingCommissionRevenue")).isEqualByComparingTo("500");
        assertThat((BigDecimal) totals.get("averageRate")).isEqualByComparingTo("20");
        assertThat((BigDecimal) totals.get("totalSettlements")).isEqualByComparingTo("13500");
        assertThat((BigDecimal) totals.get("settledAmount")).isEqualByComparingTo("4000");
        @SuppressWarnings("unchecked")
        var trend = (List<Map<String, Object>>) totals.get("revenueTrend");
        assertThat(trend).hasSize(1);
        var today = LocalDate.now(ZoneId.of("Asia/Colombo"));
        assertThat(trend.get(0).get("date")).isEqualTo(today.toString());
        assertThat(trend.get(0).get("date")).isEqualTo(today.toString());
        assertThat((BigDecimal) trend.get(0).get("value")).isEqualByComparingTo("1000");
        assertThat(trend.stream().map(point -> (BigDecimal) point.get("value")).reduce(BigDecimal.ZERO, BigDecimal::add))
                .isEqualByComparingTo((BigDecimal) totals.get("totalRevenue"));

        var updated = service.update("split-1", new CommissionTransactionService.SplitUpdateRequest(new BigDecimal("20000"), "Cleaning"), "split-1");
        assertThat(updated.transactionId()).isEqualTo(saved.transactionId());
        assertThat(updated.date()).isEqualTo(saved.date());
        assertThat(updated.status()).isEqualTo(saved.status());
        assertThat(updated.commissionAmount()).isEqualByComparingTo("1000");
        assertThat(updated.providerEarning()).isEqualByComparingTo("19000");
        assertThat(updated.commissionSnapshot().id()).isNotEqualTo(saved.commissionSnapshot().id());
        when(transactions.findAll()).thenReturn(List.of(updated));
        var updatedTotals = new CommissionDashboardController(rules, transactions, snapshots, audit, service).dashboard();
        assertThat((BigDecimal) updatedTotals.get("totalRevenue")).isEqualByComparingTo("0");
        assertThat((BigDecimal) updatedTotals.get("totalSettlements")).isEqualByComparingTo("19000");
        @SuppressWarnings("unchecked")
        var distribution = (Map<String, BigDecimal>) updatedTotals.get("categoryDistribution");
        assertThat(distribution).containsKey("Cleaning");
        assertThat(distribution.get("Cleaning")).isEqualByComparingTo("0");
        assertThatThrownBy(() -> service.update("split-1", new CommissionTransactionService.SplitUpdateRequest(BigDecimal.ZERO, "Cleaning"), "split-1"))
                .isInstanceOf(IllegalArgumentException.class);
        when(transactions.findById("split-1")).thenReturn(Optional.of(updated));
        service.delete("split-1", "split-1");
        verify(transactions).delete(updated);
        when(transactions.findAll()).thenReturn(List.of());
        var emptyTotals = new CommissionDashboardController(rules, transactions, snapshots, audit, service).dashboard();
        assertThat((BigDecimal) emptyTotals.get("totalRevenue")).isEqualByComparingTo("0");
        assertThat((BigDecimal) emptyTotals.get("totalSettlements")).isEqualByComparingTo("0");
        assertThat((BigDecimal) emptyTotals.get("averageRate")).isEqualByComparingTo("0");
        when(transactions.findById("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.delete("missing", "missing")).isInstanceOf(CommissionRuleService.NotFoundException.class);
        assertThatThrownBy(() -> service.update("missing", new CommissionTransactionService.SplitUpdateRequest(BigDecimal.TEN, "Cleaning"), "missing"))
                .isInstanceOf(CommissionRuleService.NotFoundException.class);
    }
}
