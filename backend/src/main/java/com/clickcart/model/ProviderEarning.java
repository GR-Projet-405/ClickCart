package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * MongoDB document representing a Service Provider's earning record.
 * Conforms to Business Rule BR-07: Commission rate applied is stored as a historical snapshot.
 */
@Document(collection = "provider_earnings")
@CompoundIndexes({
    @CompoundIndex(name = "provider_created_idx", def = "{'providerId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "provider_status_idx", def = "{'providerId': 1, 'status': 1}")
})
public class ProviderEarning {

    @Id
    private String id;

    @Indexed
    private String providerId;

    @Indexed
    private String bookingId;

    @Indexed(unique = true)
    private String transactionId;

    private String serviceTitle;
    private String category;
    private String customerName;

    private BigDecimal grossAmount;
    private BigDecimal commissionRate;    // Snapshot percentage, e.g. 0.10 for 10%
    private BigDecimal commissionAmount;  // Snapshot deduction, e.g. LKR 1,000.00
    private BigDecimal netAmount;         // grossAmount - commissionAmount, e.g. LKR 9,000.00

    private String currency = "LKR";
    private EarningStatus status = EarningStatus.PENDING;

    private String settlementBatchId;
    private Instant serviceCompletedAt;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public ProviderEarning() {
    }

    public ProviderEarning(String providerId, String bookingId, String transactionId,
                           String serviceTitle, String category, String customerName,
                           BigDecimal grossAmount, BigDecimal commissionRate,
                           BigDecimal commissionAmount, BigDecimal netAmount,
                           String currency, EarningStatus status,
                           Instant serviceCompletedAt) {
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
        this.currency = currency != null ? currency : "LKR";
        this.status = status != null ? status : EarningStatus.PENDING;
        this.serviceCompletedAt = serviceCompletedAt;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

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

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
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
        this.updatedAt = Instant.now();
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
