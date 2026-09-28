package com.clickcart.dto;

import java.math.BigDecimal;

public class EarningsSummaryResponse {
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalCommissionDeducted;
    private BigDecimal netAvailableBalance;
    private BigDecimal pendingClearance;
    private Double grossGrowthPercentage;
    private Long activePendingBookingsCount;
    private String currency = "LKR";

    public EarningsSummaryResponse() {
    }

    public EarningsSummaryResponse(BigDecimal totalGrossRevenue, BigDecimal totalCommissionDeducted,
                                   BigDecimal netAvailableBalance, BigDecimal pendingClearance,
                                   Double grossGrowthPercentage, Long activePendingBookingsCount,
                                   String currency) {
        this.totalGrossRevenue = totalGrossRevenue;
        this.totalCommissionDeducted = totalCommissionDeducted;
        this.netAvailableBalance = netAvailableBalance;
        this.pendingClearance = pendingClearance;
        this.grossGrowthPercentage = grossGrowthPercentage;
        this.activePendingBookingsCount = activePendingBookingsCount;
        this.currency = currency != null ? currency : "LKR";
    }

    public BigDecimal getTotalGrossRevenue() {
        return totalGrossRevenue;
    }

    public void setTotalGrossRevenue(BigDecimal totalGrossRevenue) {
        this.totalGrossRevenue = totalGrossRevenue;
    }

    public BigDecimal getTotalCommissionDeducted() {
        return totalCommissionDeducted;
    }

    public void setTotalCommissionDeducted(BigDecimal totalCommissionDeducted) {
        this.totalCommissionDeducted = totalCommissionDeducted;
    }

    public BigDecimal getNetAvailableBalance() {
        return netAvailableBalance;
    }

    public void setNetAvailableBalance(BigDecimal netAvailableBalance) {
        this.netAvailableBalance = netAvailableBalance;
    }

    public BigDecimal getPendingClearance() {
        return pendingClearance;
    }

    public void setPendingClearance(BigDecimal pendingClearance) {
        this.pendingClearance = pendingClearance;
    }

    public Double getGrossGrowthPercentage() {
        return grossGrowthPercentage;
    }

    public void setGrossGrowthPercentage(Double grossGrowthPercentage) {
        this.grossGrowthPercentage = grossGrowthPercentage;
    }

    public Long getActivePendingBookingsCount() {
        return activePendingBookingsCount;
    }

    public void setActivePendingBookingsCount(Long activePendingBookingsCount) {
        this.activePendingBookingsCount = activePendingBookingsCount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
