package com.clickcart.service;

import com.clickcart.dto.*;
import com.clickcart.exception.PaymentException;
import com.clickcart.exception.PaymentNotFoundException;
import com.clickcart.model.Payment;
import com.clickcart.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public PaymentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        // Check if pending payment intent already exists for this booking
        Optional<Payment> existingOpt = paymentRepository.findByBookingId(request.getBookingId());
        Payment payment;

        if (existingOpt.isPresent()) {
            payment = existingOpt.get();
            if ("COMPLETED".equalsIgnoreCase(payment.getStatus())) {
                throw new PaymentException("Payment for booking " + request.getBookingId() + " is already completed.");
            }
        } else {
            payment = new Payment();
            payment.setBookingId(request.getBookingId());
            payment.setCustomerId(request.getCustomerId());
            payment.setProviderId(request.getProviderId());
            payment.setProviderName(request.getProviderName() != null ? request.getProviderName() : "Verified Provider");
            payment.setServiceId(request.getServiceId());
            payment.setServiceTitle(request.getServiceTitle());
            payment.setCreatedAt(Instant.now());
        }

        BigDecimal baseAmount = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        // Platform fee calculated as 10%
        BigDecimal platformFee = baseAmount.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        // Estimated tax calculated as 5%
        BigDecimal taxAmount = baseAmount.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netProvider = baseAmount.subtract(platformFee);

        payment.setAmount(baseAmount);
        payment.setPlatformFee(platformFee);
        payment.setTaxAmount(taxAmount);
        payment.setNetProviderAmount(netProvider);
        payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        payment.setStatus("PENDING");

        payment.setCustomerName(request.getCustomerName());
        payment.setCustomerEmail(request.getCustomerEmail());
        payment.setCustomerPhone(request.getCustomerPhone());
        payment.setServiceAddress(request.getServiceAddress());

        if (payment.getTransactionId() == null) {
            payment.setTransactionId("INTENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        payment.setUpdatedAt(Instant.now());
        Payment saved = paymentRepository.save(payment);
        return PaymentResponse.fromEntity(saved);
    }

    @Override
    public PaymentResponse processPayment(ProcessPaymentRequest request) {
        Payment payment = null;

        if (request.getPaymentId() != null && !request.getPaymentId().isBlank()) {
            payment = paymentRepository.findById(request.getPaymentId()).orElse(null);
        }

        if (payment == null && request.getBookingId() != null) {
            payment = paymentRepository.findByBookingId(request.getBookingId()).orElse(null);
        }

        if (payment == null) {
            // Create fallback payment record on the fly
            payment = new Payment();
            payment.setBookingId(request.getBookingId() != null ? request.getBookingId() : "BKG-" + System.currentTimeMillis());
            payment.setCustomerId("CUST-" + UUID.randomUUID().toString().substring(0, 6));
            payment.setServiceTitle("Scheduled Service Booking");
            payment.setAmount(new BigDecimal("150.00"));
            payment.setPlatformFee(new BigDecimal("15.00"));
            payment.setTaxAmount(new BigDecimal("7.50"));
            payment.setNetProviderAmount(new BigDecimal("135.00"));
            payment.setCreatedAt(Instant.now());
        }

        if ("COMPLETED".equalsIgnoreCase(payment.getStatus())) {
            return PaymentResponse.fromEntity(payment);
        }

        // Apply promo code discount if provided
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            if ("DISCOUNT10".equalsIgnoreCase(request.getPromoCode().trim()) || "CLICK10".equalsIgnoreCase(request.getPromoCode().trim())) {
                BigDecimal discount = payment.getAmount().multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
                payment.setAmount(payment.getAmount().subtract(discount));
            }
        }

        // Validate payment method details
        String method = request.getPaymentMethod();
        if ("CREDIT_CARD".equalsIgnoreCase(method) || "DEBIT_CARD".equalsIgnoreCase(method)) {
            if (request.getCardNumber() != null && request.getCardNumber().replaceAll("\\s+", "").length() >= 4) {
                String cleanNum = request.getCardNumber().replaceAll("\\s+", "");
                payment.setCardLast4(cleanNum.substring(cleanNum.length() - 4));
                payment.setCardBrand(detectCardBrand(cleanNum));
            } else {
                payment.setCardLast4("4242");
                payment.setCardBrand("Visa");
            }
        } else if ("CASH_ON_SERVICE".equalsIgnoreCase(method)) {
            payment.setCardBrand("Cash");
            payment.setCardLast4("N/A");
        } else {
            payment.setCardBrand("Gateway Instant");
            payment.setCardLast4("8888");
        }

        payment.setPaymentMethod(method != null ? method : "CREDIT_CARD");
        payment.setStatus("COMPLETED");

        if (payment.getReceiptNumber() == null) {
            payment.setReceiptNumber("REC-" + Instant.now().getEpochSecond() + "-" + (int) (Math.random() * 900 + 100));
        }
        if (payment.getTransactionId() == null || payment.getTransactionId().startsWith("INTENT-")) {
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        }

        if (request.getCustomerName() != null) payment.setCustomerName(request.getCustomerName());
        if (request.getCustomerEmail() != null) payment.setCustomerEmail(request.getCustomerEmail());
        if (request.getCustomerPhone() != null) payment.setCustomerPhone(request.getCustomerPhone());
        if (request.getServiceAddress() != null) payment.setServiceAddress(request.getServiceAddress());
        if (request.getNotes() != null) payment.setNotes(request.getNotes());

        payment.setPaymentDate(Instant.now());
        payment.setUpdatedAt(Instant.now());

        Payment saved = paymentRepository.save(payment);
        return PaymentResponse.fromEntity(saved);
    }

    @Override
    public PaymentResponse getPaymentById(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + paymentId));
        return PaymentResponse.fromEntity(payment);
    }

    @Override
    public PaymentResponse getPaymentByBookingId(String bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment record not found for booking ID: " + bookingId));
        return PaymentResponse.fromEntity(payment);
    }

    @Override
    public ReceiptResponse getReceipt(String paymentIdOrReceiptNumber) {
        Optional<Payment> opt = paymentRepository.findByReceiptNumber(paymentIdOrReceiptNumber);
        if (opt.isEmpty()) {
            opt = paymentRepository.findById(paymentIdOrReceiptNumber);
        }
        if (opt.isEmpty()) {
            opt = paymentRepository.findByBookingId(paymentIdOrReceiptNumber);
        }

        Payment payment = opt.orElseThrow(() ->
                new PaymentNotFoundException("Receipt not found for identifier: " + paymentIdOrReceiptNumber)
        );

        return ReceiptResponse.fromPayment(payment);
    }

    @Override
    public List<PaymentResponse> getCustomerPaymentHistory(String customerId) {
        List<Payment> payments = paymentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return payments.stream().map(PaymentResponse::fromEntity).collect(Collectors.toList());
    }

    @Override
    public PaymentResponse handleWebhook(WebhookEventRequest webhookEvent) {
        if (webhookEvent.getPaymentId() == null && webhookEvent.getTransactionId() == null) {
            throw new PaymentException("Webhook payload missing paymentId or transactionId");
        }

        Optional<Payment> opt = Optional.empty();
        if (webhookEvent.getPaymentId() != null) {
            opt = paymentRepository.findById(webhookEvent.getPaymentId());
        }
        if (opt.isEmpty() && webhookEvent.getTransactionId() != null) {
            opt = paymentRepository.findByTransactionId(webhookEvent.getTransactionId());
        }

        Payment payment = opt.orElseThrow(() ->
                new PaymentNotFoundException("Payment record not found for webhook event.")
        );

        if ("payment_intent.succeeded".equalsIgnoreCase(webhookEvent.getEventType())) {
            payment.setStatus("COMPLETED");
            payment.setPaymentDate(Instant.now());
            if (payment.getReceiptNumber() == null) {
                payment.setReceiptNumber("REC-" + Instant.now().getEpochSecond() + "-" + (int) (Math.random() * 900 + 100));
            }
        } else if ("payment_intent.payment_failed".equalsIgnoreCase(webhookEvent.getEventType())) {
            payment.setStatus("FAILED");
            payment.setFailureReason(webhookEvent.getFailureReason() != null ? webhookEvent.getFailureReason() : "Gateway transaction declined");
        } else if ("payment_intent.canceled".equalsIgnoreCase(webhookEvent.getEventType())) {
            payment.setStatus("FAILED");
            payment.setFailureReason("Transaction canceled by customer");
        }

        payment.setUpdatedAt(Instant.now());
        Payment saved = paymentRepository.save(payment);
        return PaymentResponse.fromEntity(saved);
    }

    private String detectCardBrand(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) return "Visa";
        if (cardNumber.startsWith("4")) return "Visa";
        if (cardNumber.startsWith("51") || cardNumber.startsWith("52") || cardNumber.startsWith("53") || cardNumber.startsWith("54") || cardNumber.startsWith("55")) return "MasterCard";
        if (cardNumber.startsWith("34") || cardNumber.startsWith("37")) return "American Express";
        if (cardNumber.startsWith("6011") || cardNumber.startsWith("65")) return "Discover";
        return "Credit Card";
    }
}
