package com.clickcart.dto;

import com.clickcart.model.EarningStatus;
import com.clickcart.model.ProviderEarning;

import java.math.BigDecimal;
import java.time.Instant;

public class ProviderTransactionDto {
    private String id;
    private String providerId;
    private String transactionId;
    private String bookingId;
    private String serviceTitle;
    private String category;
    private String customerName;
    private BigDecimal grossAmount;
    private BigDecimal commissionRate;
    private BigDecimal commissionAmount;
    private BigDecimal netAmount;
    private String currency;
    private EarningStatus status;
    private String settlementBatchId;
    private Instant serviceCompletedAt;
    private Instant createdAt;

    public ProviderTransactionDto() {
    }

    public ProviderTransactionDto(String id, String providerId, String bookingId, String transactionId,
            String serviceTitle, String category, String customerName,
            BigDecimal grossAmount, BigDecimal commissionRate, BigDecimal commissionAmount,
            BigDecimal netAmount, String currency, EarningStatus status,
            String settlementBatchId, Instant serviceCompletedAt, Instant createdAt) {
        this.id = id;
        this.providerId = providerId;
        this.bookingId = bookingId;
        this.transactionId = transactionId;
        this.serviceTitle = serviceTitle;
        this.category = category;
        this.customerName = customerName;
        this.grossAmount = grossAmount;
        this.commissionRate = commissionRate;
        this.commissionAmount = commissionAmount;
        this.netAmount = netAmount;
        this.currency = currency;
        this.status = status;
        this.settlementBatchId = settlementBatchId;
        this.serviceCompletedAt = serviceCompletedAt;
        this.createdAt = createdAt;
    }

    public static ProviderTransactionDto fromEntity(ProviderEarning entity) {
        ProviderTransactionDto dto = new ProviderTransactionDto();
        dto.setId(entity.getId());
        dto.setProviderId(entity.getProviderId());
        dto.setTransactionId(entity.getTransactionId());
        dto.setBookingId(entity.getBookingId());
        dto.setServiceTitle(entity.getServiceTitle());
        dto.setCategory(entity.getCategory());
        dto.setCustomerName(entity.getCustomerName());
        dto.setGrossAmount(entity.getGrossAmount());
        dto.setCommissionRate(entity.getCommissionRate());
        dto.setCommissionAmount(entity.getCommissionAmount());
        dto.setNetAmount(entity.getNetAmount());
        dto.setCurrency(entity.getCurrency());
        dto.setStatus(entity.getStatus());
        dto.setSettlementBatchId(entity.getSettlementBatchId());
        dto.setServiceCompletedAt(entity.getServiceCompletedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getGrossAmount() {
        return grossAmount;
    }

    public void setGrossAmount(BigDecimal grossAmount) {
        this.grossAmount = grossAmount;
    }

    public BigDecimal getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public BigDecimal getNetAmount() {
        return netAmount;
    }

    public void setNetAmount(BigDecimal netAmount) {
        this.netAmount = netAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public EarningStatus getStatus() {
        return status;
    }

    public void setStatus(EarningStatus status) {
        this.status = status;
    }

    public String getSettlementBatchId() {
        return settlementBatchId;
    }

    public void setSettlementBatchId(String settlementBatchId) {
        this.settlementBatchId = settlementBatchId;
    }

    public Instant getServiceCompletedAt() {
        return serviceCompletedAt;
    }

    public void setServiceCompletedAt(Instant serviceCompletedAt) {
        this.serviceCompletedAt = serviceCompletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}