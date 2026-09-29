package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document("commission_transactions")
public record CommissionTransaction(@Id String transactionId, String customer, String provider, String service,
                                    BigDecimal bookingAmount, String category, BigDecimal commissionAmount, BigDecimal providerEarning,
                                    Instant date, TransactionStatus status, CommissionSnapshot commissionSnapshot, String publicId) {
    public CommissionTransaction(String transactionId, String customer, String provider, String service,
                                 BigDecimal bookingAmount, String category, BigDecimal commissionAmount, BigDecimal providerEarning,
                                 Instant date, TransactionStatus status, CommissionSnapshot commissionSnapshot) {
        this(transactionId, customer, provider, service, bookingAmount, category, commissionAmount, providerEarning,
                date, status, commissionSnapshot, transactionId != null && transactionId.matches("[A-Z]{2}[0-9]{3}") ? transactionId : null);
    }
    public enum TransactionStatus { PENDING, SETTLED, FAILED }
}
