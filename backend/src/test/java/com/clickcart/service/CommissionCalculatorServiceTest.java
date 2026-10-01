package com.clickcart.service;

import com.clickcart.model.CommissionRule;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class CommissionCalculatorServiceTest {
    @Test
    void calculatesPercentageAndProviderPayout() {
        CommissionRule rule = new CommissionRule("Home Repair", "", "Home Services", CommissionRule.CommissionType.PERCENTAGE,
                new BigDecimal("10"), BigDecimal.ZERO, null, BigDecimal.ZERO, CommissionRule.ProviderTier.ALL, 10,
                CommissionRule.RuleStatus.ACTIVE, Instant.now(), null, "admin");

        CommissionCalculatorService.Calculation result = new CommissionCalculatorService().calculate(new BigDecimal("10000"), rule);

        assertThat(result.commissionAmount()).isEqualByComparingTo("1000.00");
        assertThat(result.providerPayout()).isEqualByComparingTo("9000.00");
    }

    @Test
    void usesPercentageForLegacyFixedFeeRulesWithoutAFixedAmount() {
        for (BigDecimal fixedFee : new BigDecimal[] { BigDecimal.ZERO, null }) {
            CommissionRule rule = new CommissionRule("Cleaning", "", "Cleaning Services", CommissionRule.CommissionType.FIXED_FEE,
                    new BigDecimal("5"), BigDecimal.ZERO, null, fixedFee, CommissionRule.ProviderTier.ALL, 10,
                    CommissionRule.RuleStatus.ACTIVE, Instant.now(), null, "admin");
            var calculator = new CommissionCalculatorService();
            assertThat(calculator.calculate(new BigDecimal("10000"), rule).commissionAmount()).isEqualByComparingTo("500.00");
            var updated = calculator.calculate(new BigDecimal("18000"), rule);
            assertThat(updated.commissionAmount()).isEqualByComparingTo("900.00");
            assertThat(updated.providerPayout()).isEqualByComparingTo("17100.00");
        }
    }

    @Test
    void keepsConfiguredFixedFeesEvenWhenRateIsPresent() {
        CommissionRule rule = new CommissionRule("Fixed", "", "Cleaning Services", CommissionRule.CommissionType.FIXED_FEE,
                new BigDecimal("5"), BigDecimal.ZERO, null, new BigDecimal("200"), CommissionRule.ProviderTier.ALL, 10,
                CommissionRule.RuleStatus.ACTIVE, Instant.now(), null, "admin");
        assertThat(new CommissionCalculatorService().calculate(new BigDecimal("18000"), rule).commissionAmount())
                .isEqualByComparingTo("200.00");
    }

    @Test
    void capsCommissionAtBookingAmount() {
        CommissionRule rule = new CommissionRule("Fixed", "", "ALL", CommissionRule.CommissionType.FIXED_FEE,
                BigDecimal.ZERO, BigDecimal.ZERO, null, new BigDecimal("200"), CommissionRule.ProviderTier.ALL, 10,
                CommissionRule.RuleStatus.ACTIVE, Instant.now(), null, "admin");

        CommissionCalculatorService.Calculation result = new CommissionCalculatorService().calculate(new BigDecimal("100"), rule);

        assertThat(result.commissionAmount()).isEqualByComparingTo("100.00");
        assertThat(result.providerPayout()).isEqualByComparingTo("0.00");
    }
}