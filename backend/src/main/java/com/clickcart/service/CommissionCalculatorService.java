package com.clickcart.service;

import com.clickcart.model.CommissionRule;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CommissionCalculatorService {
    public Calculation calculate(BigDecimal bookingAmount, CommissionRule rule) {
        if (bookingAmount == null || bookingAmount.signum() < 0) throw new IllegalArgumentException("Booking amount must not be negative");
        BigDecimal amount = scale(bookingAmount);
        BigDecimal percentage = scale(amount.multiply(rule.getRate()).divide(BigDecimal.valueOf(100), 8, RoundingMode.HALF_UP));
        BigDecimal fixedFee = rule.getFixedFee() == null ? BigDecimal.ZERO : rule.getFixedFee();
        // Legacy rule forms stored a percentage rate even for FIXED_FEE, with no fixed fee input.
        boolean percentageOnly = fixedFee.signum() == 0 && rule.getRate().signum() > 0;
        BigDecimal commission = switch (rule.getCommissionType()) {
            case PERCENTAGE -> percentage;
            case FIXED_FEE -> percentageOnly ? percentage : fixedFee;
            case HYBRID -> percentage.add(fixedFee);
        };
        if (rule.getMinimumFee() != null) commission = commission.max(rule.getMinimumFee());
        if (rule.getMaximumFee() != null) commission = commission.min(rule.getMaximumFee());
        commission = scale(commission.max(BigDecimal.ZERO).min(amount));
        return new Calculation(amount, commission, scale(amount.subtract(commission)), rule.getRate());
    }

    private BigDecimal scale(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
    public record Calculation(BigDecimal grossAmount, BigDecimal commissionAmount, BigDecimal providerPayout, BigDecimal commissionRate) {}
}
