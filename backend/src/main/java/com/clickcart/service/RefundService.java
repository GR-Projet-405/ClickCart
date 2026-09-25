package com.clickcart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.clickcart.dto.RefundRequest;
import com.clickcart.dto.StatusUpdateRequest;
import com.clickcart.model.Refund;
import com.clickcart.repository.RefundRepository;

@Service
public class RefundService {

    private final RefundRepository repo;

    public RefundService(RefundRepository repo) {
        this.repo = repo;
    }

    /**
     * Submit a new refund request (status = PENDING).
     */
    public Refund submit(RefundRequest req) {
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

    /**
     * Retrieve a single refund by its MongoDB id.
     */
    public Refund getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Refund not found: " + id));
    }

    /**
     * Update refund status (admin / internal use).
     */
    public Refund updateStatus(String id, StatusUpdateRequest req) {
        Refund refund = getById(id);
        refund.setStatus(req.getStatus());
        refund.setUpdatedAt(Instant.now());
        return repo.save(refund);
    }

    /**
     * Cancel / delete a PENDING refund by a customer.
     */
    public void cancel(String id) {
        Refund refund = getById(id);
        if (!"PENDING".equals(refund.getStatus())) {
            throw new RuntimeException("Only PENDING refunds can be cancelled");
        }
        repo.deleteById(id);
    }

    //helpers
    private String generateRefundId() {
        // e.g. RFD-77402
        int suffix = (int) (Math.random() * 90000) + 10000;
        return "RFD-" + suffix;
    }
}
