package com.clickcart.service;

import com.clickcart.dto.*;
import com.clickcart.model.*;
import com.clickcart.repository.*;
import com.clickcart.exception.*;
import com.clickcart.security.CurrentProvider;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository payments;
    private final BookingRepository bookings;
    private final ProviderJobRepository jobs;
    private final CommissionTransactionService commissions;
    private final com.clickcart.util.CurrentCustomerResolver identity;
    public PaymentServiceImpl(PaymentRepository payments, BookingRepository bookings, ProviderJobRepository jobs,
            CommissionTransactionService commissions, com.clickcart.util.CurrentCustomerResolver identity) {
        this.payments=payments; this.bookings=bookings; this.jobs=jobs; this.commissions=commissions; this.identity=identity;
    }
    private String customer() {
        var auth=SecurityContextHolder.getContext().getAuthentication();
        if (auth==null || !auth.isAuthenticated()) throw new UnauthorizedException("Sign in to continue");
        if(auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("ROLE_CUSTOMER"))) throw new ForbiddenException("Customer access required");
        return identity.getCurrentCustomerId();
    }
    private Booking ownBooking(String id) {
        String customerId=customer();
        Booking b=bookings.findById(id).orElseThrow(()->new PaymentNotFoundException("Booking not found"));
        if(!customerId.equals(b.getCustomerId())) throw new ForbiddenException("This booking belongs to another account");
        if(!java.util.Set.of(BookingStatus.CONFIRMED,BookingStatus.ACCEPTED,BookingStatus.IN_PROGRESS,BookingStatus.COMPLETED).contains(b.getStatus()))
            throw new PaymentException("The provider must accept this booking before payment can be arranged");
        return b;
    }
    private Payment ownPayment(Payment p) {
        if(!customer().equals(p.getCustomerId())) throw new ForbiddenException("This payment belongs to another account");
        return p;
    }
    private Payment cashIntent(Booking b) {
        Payment p=payments.findByBookingId(b.getId()).orElseGet(Payment::new);
        if(p.getId()!=null) return p;
        p.setId("cash-"+b.getId()); p.setBookingId(b.getId()); p.setCustomerId(b.getCustomerId()); p.setProviderId(b.getProviderId());
        p.setProviderName(b.getProviderName()); p.setServiceId(b.getServiceId()); p.setServiceTitle(b.getServiceTitle());
        p.setAmount(BigDecimal.valueOf(b.getTotalCost())); p.setPlatformFee(BigDecimal.ZERO); p.setTaxAmount(BigDecimal.ZERO);
        p.setCurrency(b.getCurrency()); p.setCustomerName(b.getCustomerName()); p.setCustomerEmail(b.getCustomerEmail());
        p.setCustomerPhone(b.getCustomerPhone()); p.setServiceAddress(b.getAddress());
        p.setPaymentMethod("CASH_ON_SERVICE"); p.setStatus("PENDING"); p.setCreatedAt(Instant.now()); p.setUpdatedAt(Instant.now());
        return payments.save(p);
    }
    @Override public PaymentResponse createPaymentIntent(CreatePaymentIntentRequest r) { return PaymentResponse.fromEntity(cashIntent(ownBooking(r.getBookingId()))); }
    @Override public PaymentResponse processPayment(ProcessPaymentRequest r) {
        if(!"CASH_ON_SERVICE".equals(r.getPaymentMethod())) throw new PaymentException("Online payments are not configured. Choose cash on service.");
        Booking b=ownBooking(r.getBookingId());
        Payment p=cashIntent(b);
        if(r.getPaymentId()!=null && !r.getPaymentId().equals(p.getId())) throw new PaymentException("Payment does not match this booking");
        // Selecting cash is not proof that money has changed hands.
        return PaymentResponse.fromEntity(p);
    }
    public PaymentResponse confirmCash(String bookingId) {
        String provider=CurrentProvider.id();
        Booking b=bookings.findById(bookingId).orElseThrow(()->new PaymentNotFoundException("Booking not found"));
        if(!provider.equals(b.getProviderId())) throw new ForbiddenException("This booking belongs to another provider");
        if(b.getStatus()!=BookingStatus.COMPLETED) throw new PaymentException("Complete the service before confirming cash received");
        var split=commissions.create(new CommissionTransactionService.TransactionRequest("JOB-booking-"+b.getId(),b.getCustomerName(),provider,b.getServiceTitle(),BigDecimal.valueOf(b.getTotalCost()),b.getServiceCategory(),CommissionRule.ProviderTier.ALL));
        Payment p=cashIntent(b);
        if(!"COMPLETED".equals(p.getStatus())) {
            p.setStatus("COMPLETED"); p.setNetProviderAmount(split.providerEarning());
            p.setTransactionId("CASH-"+b.getId()); p.setReceiptNumber("REC-"+b.getId());
            p.setPaymentDate(Instant.now()); p.setUpdatedAt(Instant.now()); p=payments.save(p);
        }
        jobs.findById("booking-"+b.getId()).ifPresent(job->{job.setPaymentHold("CASH_RECEIVED");jobs.save(job);});
        b.setStatusLabel("Completed — cash received"); bookings.save(b);
        return PaymentResponse.fromEntity(p);
    }
    @Override public PaymentResponse getPaymentById(String id) { return PaymentResponse.fromEntity(ownPayment(payments.findById(id).orElseThrow(()->new PaymentNotFoundException("Payment not found")))); }
    @Override public PaymentResponse getPaymentByBookingId(String id) { return PaymentResponse.fromEntity(ownPayment(payments.findByBookingId(id).orElseThrow(()->new PaymentNotFoundException("Payment not found")))); }
    @Override public ReceiptResponse getReceipt(String id) {
        Payment p=ownPayment(payments.findByReceiptNumber(id).or(()->payments.findById(id)).or(()->payments.findByBookingId(id)).orElseThrow(()->new PaymentNotFoundException("Receipt not found")));
        if(!"COMPLETED".equals(p.getStatus())) throw new PaymentException("A receipt is available after cash receipt is confirmed");
        return ReceiptResponse.fromPayment(p);
    }
    @Override public List<PaymentResponse> getCustomerPaymentHistory(String ignored) { return payments.findByCustomerIdOrderByCreatedAtDesc(customer()).stream().map(PaymentResponse::fromEntity).toList(); }
    @Override public PaymentResponse handleWebhook(WebhookEventRequest r) { throw new ForbiddenException("Online payment webhooks are not configured"); }
}
