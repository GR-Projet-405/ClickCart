package com.clickcart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for POST /api/provider/settlements
 */
public class SettlementCreateRequest {

    @NotBlank(message = "Merchant/Recipient name is required")
    private String merchantRecipient;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least LKR 1.00")
    private Double amount;

    @NotBlank(message = "Capture date is required")
    private String captureDate;      // ISO format: yyyy-MM-dd

    @NotBlank(message = "Settlement date is required")
    private String settlementDate;   // ISO format: yyyy-MM-dd

    @NotBlank(message = "Payout method is required")
    private String payoutMethod;

    @NotBlank(message = "Finance state is required")
    private String financeState;

    // getters & setters

    public String getMerchantRecipient() { return merchantRecipient; }
    public void setMerchantRecipient(String merchantRecipient) { this.merchantRecipient = merchantRecipient; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCaptureDate() { return captureDate; }
    public void setCaptureDate(String captureDate) { this.captureDate = captureDate; }

    public String getSettlementDate() { return settlementDate; }
    public void setSettlementDate(String settlementDate) { this.settlementDate = settlementDate; }

    public String getPayoutMethod() { return payoutMethod; }
    public void setPayoutMethod(String payoutMethod) { this.payoutMethod = payoutMethod; }

    public String getFinanceState() { return financeState; }
    public void setFinanceState(String financeState) { this.financeState = financeState; }
}
