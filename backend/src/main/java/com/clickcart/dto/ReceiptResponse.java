package com.clickcart.dto;

import com.clickcart.model.Payment;
import java.math.BigDecimal;
import java.time.Instant;

public class ReceiptResponse {

    private String receiptNumber;
    private String paymentId;
    private String bookingId;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String providerName;
    private String serviceTitle;
    private String serviceAddress;

    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal platformFee;
    private BigDecimal totalAmount;

    private String currency;
    private String paymentMethod;
    private String status;
    private String transactionId;
    private String cardLast4;

    private Instant issueDate;

    public ReceiptResponse() {
    }

    public static ReceiptResponse fromPayment(Payment payment) {
        if (payment == null) return null;
        ReceiptResponse r = new ReceiptResponse();
        r.setReceiptNumber(payment.getReceiptNumber());
        r.setPaymentId(payment.getId());
        r.setBookingId(payment.getBookingId());

        r.setCustomerName(payment.getCustomerName());
        r.setCustomerEmail(payment.getCustomerEmail());
        r.setCustomerPhone(payment.getCustomerPhone());

        r.setProviderName(payment.getProviderName());
        r.setServiceTitle(payment.getServiceTitle());
        r.setServiceAddress(payment.getServiceAddress());

        BigDecimal total = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
        BigDecimal fee = payment.getPlatformFee() != null ? payment.getPlatformFee() : BigDecimal.ZERO;
        BigDecimal tax = payment.getTaxAmount() != null ? payment.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal sub = total.subtract(fee).subtract(tax);
        if (sub.compareTo(BigDecimal.ZERO) < 0) {
            sub = total;
        }

        r.setSubtotal(sub);
        r.setTaxAmount(tax);
        r.setPlatformFee(fee);
        r.setTotalAmount(total);

        r.setCurrency(payment.getCurrency() != null ? payment.getCurrency() : "USD");
        r.setPaymentMethod(payment.getPaymentMethod());
        r.setStatus(payment.getStatus());
        r.setTransactionId(payment.getTransactionId());
        r.setCardLast4(payment.getCardLast4());

        r.setIssueDate(payment.getPaymentDate() != null ? payment.getPaymentDate() : payment.getCreatedAt());
        return r;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
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

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public String getServiceAddress() {
        return serviceAddress;
    }

    public void setServiceAddress(String serviceAddress) {
        this.serviceAddress = serviceAddress;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public Instant getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(Instant issueDate) {
        this.issueDate = issueDate;
    }
}
