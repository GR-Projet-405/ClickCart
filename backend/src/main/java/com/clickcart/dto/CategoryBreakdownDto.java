package com.clickcart.dto;

import java.math.BigDecimal;

public class CategoryBreakdownDto {
    private String category;
    private BigDecimal amount;
    private Double percentage;

    public CategoryBreakdownDto() {
    }

    public CategoryBreakdownDto(String category, BigDecimal amount, Double percentage) {
        this.category = category;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
