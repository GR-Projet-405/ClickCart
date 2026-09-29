package com.clickcart.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * MongoDB document representing a single settlement / payout record
 * for the Settlement Tracking & Authorized Finance States page.
 */
@Document(collection = "settlements")
@CompoundIndex(name = "provider_state_capture",
    def = "{'providerId': 1, 'financeState': 1, 'captureDate': -1}")
public class Settlement {

    @Id
    private String id;

    @Indexed
    private String providerId;

    private String merchantRecipient;
    private BigDecimal amount;
    private BigDecimal fee;
    private BigDecimal netAmount;
    private LocalDate captureDate;
    private LocalDate settlementDate;
    private String payoutMethod;   // Bank Transfer | ACH | Wire Transfer
    private String financeState;   // Authorized | Captured | Settled | Released | On Hold | Disputed

    public Settlement() {}

    // ── getters / setters ────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getMerchantRecipient() { return merchantRecipient; }
    public void setMerchantRecipient(String merchantRecipient) { this.merchantRecipient = merchantRecipient; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }

    public BigDecimal getNetAmount() { return netAmount; }
    public void setNetAmount(BigDecimal netAmount) { this.netAmount = netAmount; }

    public LocalDate getCaptureDate() { return captureDate; }
    public void setCaptureDate(LocalDate captureDate) { this.captureDate = captureDate; }

    public LocalDate getSettlementDate() { return settlementDate; }
    public void setSettlementDate(LocalDate settlementDate) { this.settlementDate = settlementDate; }

    public String getPayoutMethod() { return payoutMethod; }
    public void setPayoutMethod(String payoutMethod) { this.payoutMethod = payoutMethod; }

    public String getFinanceState() { return financeState; }
    public void setFinanceState(String financeState) { this.financeState = financeState; }
}
