package com.clickcart.controller;

import com.clickcart.dto.*;
import com.clickcart.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@Valid @RequestBody CreatePaymentIntentRequest request) {
        PaymentResponse response = paymentService.createPaymentIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable("id") String id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable("bookingId") String bookingId) {
        PaymentResponse response = paymentService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receipt/{idOrReceiptNo}")
    public ResponseEntity<ReceiptResponse> getReceipt(@PathVariable("idOrReceiptNo") String idOrReceiptNo) {
        ReceiptResponse response = paymentService.getReceipt(idOrReceiptNo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentResponse>> getCustomerPaymentHistory(@PathVariable("customerId") String customerId) {
        List<PaymentResponse> responses = paymentService.getCustomerPaymentHistory(customerId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/webhook")
    public ResponseEntity<PaymentResponse> handleWebhook(@RequestBody WebhookEventRequest webhookEvent) {
        PaymentResponse response = paymentService.handleWebhook(webhookEvent);
        return ResponseEntity.ok(response);
    }
}
