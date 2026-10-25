package com.clickcart.service;

import com.clickcart.dto.*;
import java.util.List;

public interface PaymentService {

    PaymentResponse createPaymentIntent(CreatePaymentIntentRequest request);

    PaymentResponse processPayment(ProcessPaymentRequest request);

    PaymentResponse getPaymentById(String paymentId);

    PaymentResponse getPaymentByBookingId(String bookingId);

    ReceiptResponse getReceipt(String paymentIdOrReceiptNumber);

    List<PaymentResponse> getCustomerPaymentHistory(String customerId);

    PaymentResponse handleWebhook(WebhookEventRequest webhookEvent);
}
