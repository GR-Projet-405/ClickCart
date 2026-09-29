package com.clickcart.dto;

import com.clickcart.model.Payment;
import java.math.BigDecimal;
import java.time.Instant;

public class PaymentResponse {

    private String id;
    private String bookingId;
    private String customerId;
    private String providerId;
    private String providerName;
    private String serviceId;
    private String serviceTitle;

    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal netProviderAmount;
    private BigDecimal taxAmount;

    private String currency;
    private String paymentMethod;
    private String status;

    private String transactionId;
    private String receiptNumber;
    private String cardLast4;
    private String cardBrand;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String serviceAddress;

    private String notes;
    private String failureReason;

    private Instant paymentDate;
    private Instant createdAt;

    public PaymentResponse() {
    }

    public static PaymentResponse fromEntity(Payment payment) {
        if (payment == null) return null;
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setBookingId(payment.getBookingId());
        response.setCustomerId(payment.getCustomerId());
        response.setProviderId(payment.getProviderId());
        response.setProviderName(payment.getProviderName());
        response.setServiceId(payment.getServiceId());
        response.setServiceTitle(payment.getServiceTitle());
        response.setAmount(payment.getAmount());
        response.setPlatformFee(payment.getPlatformFee());
        response.setNetProviderAmount(payment.getNetProviderAmount());
        response.setTaxAmount(payment.getTaxAmount());
        response.setCurrency(payment.getCurrency());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setReceiptNumber(payment.getReceiptNumber());
        response.setCardLast4(payment.getCardLast4());
        response.setCardBrand(payment.getCardBrand());
        response.setCustomerName(payment.getCustomerName());
        response.setCustomerEmail(payment.getCustomerEmail());
        response.setCustomerPhone(payment.getCustomerPhone());
        response.setServiceAddress(payment.getServiceAddress());
        response.setNotes(payment.getNotes());
        response.setFailureReason(payment.getFailureReason());
        response.setPaymentDate(payment.getPaymentDate());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getNetProviderAmount() {
        return netProviderAmount;
    }

    public void setNetProviderAmount(BigDecimal netProviderAmount) {
        this.netProviderAmount = netProviderAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public String getCardBrand() {
        return cardBrand;
    }

    public void setCardBrand(String cardBrand) {
        this.cardBrand = cardBrand;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getServiceAddress() {
        return serviceAddress;
    }

    public void setServiceAddress(String serviceAddress) {
        this.serviceAddress = serviceAddress;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public Instant getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Instant paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
