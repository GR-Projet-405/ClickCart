package com.clickcart.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.clickcart.dto.RefundRequest;
import com.clickcart.dto.StatusUpdateRequest;
import com.clickcart.exception.BadRequestException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Payment;
import com.clickcart.model.Refund;
import com.clickcart.repository.PaymentRepository;
import com.clickcart.repository.RefundRepository;

@Service
public class RefundService {

    /** Only these status values are acceptable when updating a refund. */
    private static final Set<String> VALID_STATUSES =
            Set.of("PENDING", "APPROVED", "REJECTED", "COMPLETED");

    private final RefundRepository repo;
    private final PaymentRepository paymentRepo;

    public RefundService(RefundRepository repo, PaymentRepository paymentRepo) {
        this.repo = repo;
        this.paymentRepo = paymentRepo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BE-042 + BE-043: Submit a new refund request (status = PENDING).
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Submits a new refund request.
     *
     * <ul>
     *   <li>BE-042 – Rejects if {@code amount} exceeds the paid amount for the booking.</li>
     *   <li>BE-043 – Rejects if a PENDING refund already exists for the same booking.
     *               A previous REJECTED refund does NOT get silently reactivated; a brand-new
     *               document is created instead, preserving the audit trail.</li>
     * </ul>
     */
    public Refund submit(RefundRequest req) {

        // ── BE-042: amount cap ──────────────────────────────────────────────
        Optional<Payment> paymentOpt = paymentRepo.findByBookingId(req.getBookingId());
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            double paidAmount = payment.getAmount() != null
                    ? payment.getAmount().doubleValue() : 0.0;
            if (req.getAmount() > paidAmount) {
                throw new BadRequestException(
                        "Refund amount (" + req.getAmount() + ") exceeds the paid amount ("
                        + paidAmount + ") for booking " + req.getBookingId());
            }
        }

        // ── BE-043: no duplicate PENDING refunds for the same booking ───────
        List<Refund> pendingForBooking =
                repo.findByBookingIdAndStatus(req.getBookingId(), "PENDING");
        if (!pendingForBooking.isEmpty()) {
            throw new BadRequestException(
                    "A pending refund request already exists for booking " + req.getBookingId()
                    + ". Please wait for it to be resolved before submitting a new one.");
        }

        // Always create a new document – never reactivate a REJECTED one.
        Refund refund = new Refund();
        refund.setRefundId(generateRefundId());
        refund.setBookingId(req.getBookingId());
        refund.setCustomerId(req.getCustomerId());
        refund.setServiceName(req.getServiceName());
        refund.setAmount(req.getAmount());
        refund.setReason(req.getReason());
        refund.setDescription(req.getDescription());
        refund.setEvidenceUrls(req.getEvidenceUrls());
        refund.setStatus("PENDING");
        refund.setRequestedAt(Instant.now());
        refund.setUpdatedAt(Instant.now());
        return repo.save(refund);
    }

    /**
     * Retrieve all refunds for a customer, newest first.
     */
    public List<Refund> getByCustomer(String customerId) {
        return repo.findByCustomerIdOrderByRequestedAtDesc(customerId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BE-046: Retrieve a single refund – 404 instead of 500 for unknown ID.
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Retrieve a single refund by its MongoDB id.
     * Returns 404 Not Found (via {@link ResourceNotFoundException}) when the id is unknown.
     */
    public Refund getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Refund", id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BE-041 + BE-044: Update refund status – admin-only, validated values.
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Update refund status.
     *
     * <ul>
     *   <li>BE-041 – Only users with the {@code ADMIN} role may call this method.
     *               A CUSTOMER token receives 403 Forbidden.</li>
     *   <li>BE-044 – Only the values PENDING / APPROVED / REJECTED / COMPLETED are accepted.
     *               An empty string, null, or an arbitrary word (e.g. "BANANA") returns 400.</li>
     * </ul>
     */
    public Refund updateStatus(String id, StatusUpdateRequest req) {

        // BE-041: enforce ADMIN role
        enforceAdminRole();

        // BE-044: validate the incoming status value
        String newStatus = req.getStatus();
        if (newStatus == null || newStatus.isBlank()) {
            throw new BadRequestException("Refund status must not be blank.");
        }
        if (!VALID_STATUSES.contains(newStatus.toUpperCase())) {
            throw new BadRequestException(
                    "Invalid refund status '" + newStatus
                    + "'. Allowed values: PENDING, APPROVED, REJECTED, COMPLETED.");
        }

        Refund refund = getById(id);
        refund.setStatus(newStatus.toUpperCase());
        refund.setUpdatedAt(Instant.now());
        return repo.save(refund);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BE-045: Cancel / delete a PENDING refund.
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Cancel / delete a PENDING refund.
     * Returns cleanly (no exception) on success; throws 404 for unknown id
     * and 400 if the refund is not in PENDING state.
     */
    public void cancel(String id) {
        Refund refund = getById(id);   // 404 if not found (BE-046 fix reused here)
        if (!"PENDING".equals(refund.getStatus())) {
            throw new BadRequestException("Only PENDING refunds can be cancelled. " +
                    "Current status: " + refund.getStatus());
        }
        repo.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Throws {@link ForbiddenException} (→ 403) if the current principal does not hold
     * the {@code ROLE_ADMIN} authority.
     */
    private void enforceAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new ForbiddenException(
                    "Access denied: refund status updates require the ADMIN role.");
        }
    }

    private String generateRefundId() {
        // e.g. RFD-77402
        int suffix = (int) (Math.random() * 90000) + 10000;
        return "RFD-" + suffix;
    }
}
