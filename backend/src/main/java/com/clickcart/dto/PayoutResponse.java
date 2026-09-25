package com.clickcart.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class PayoutResponse {
    private String payoutId;
    private String providerId;
    private BigDecimal amount;
    private String currency = "LKR";
    private String status;
    private String bankName;
    private String accountMasked;
    private String estimatedArrival;
    private Instant requestedAt;

    public PayoutResponse() {
    }

    public PayoutResponse(String payoutId, String providerId, BigDecimal amount, String currency,
                          String status, String bankName, String accountMasked,
                          String estimatedArrival, Instant requestedAt) {
        this.payoutId = payoutId;
        this.providerId = providerId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.bankName = bankName;
        this.accountMasked = accountMasked;
        this.estimatedArrival = estimatedArrival;
        this.requestedAt = requestedAt;
    }

    public String getPayoutId() {
        return payoutId;
    }

    public void setPayoutId(String payoutId) {
        this.payoutId = payoutId;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountMasked() {
        return accountMasked;
    }

    public void setAccountMasked(String accountMasked) {
        this.accountMasked = accountMasked;
    }

    public String getEstimatedArrival() {
        return estimatedArrival;
    }

    public void setEstimatedArrival(String estimatedArrival) {
        this.estimatedArrival = estimatedArrival;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }
}
