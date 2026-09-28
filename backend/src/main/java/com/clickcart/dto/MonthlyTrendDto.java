package com.clickcart.dto;

import java.math.BigDecimal;

public class MonthlyTrendDto {
    private String month;
    private BigDecimal grossRevenue;
    private BigDecimal netEarning;
    private BigDecimal commissionAmount;

    public MonthlyTrendDto() {
    }

    public MonthlyTrendDto(String month, BigDecimal grossRevenue, BigDecimal netEarning, BigDecimal commissionAmount) {
        this.month = month;
        this.grossRevenue = grossRevenue;
        this.netEarning = netEarning;
        this.commissionAmount = commissionAmount;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getGrossRevenue() {
        return grossRevenue;
    }

    public void setGrossRevenue(BigDecimal grossRevenue) {
        this.grossRevenue = grossRevenue;
    }

    public BigDecimal getNetEarning() {
        return netEarning;
    }

    public void setNetEarning(BigDecimal netEarning) {
        this.netEarning = netEarning;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }
}
