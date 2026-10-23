package com.clickcart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.RefundRequest;
import com.clickcart.dto.StatusUpdateRequest;
import com.clickcart.model.Refund;
import com.clickcart.service.RefundService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService service;

    public RefundController(RefundService service) {
        this.service = service;
    }

    /*
      POST /api/refunds
      Submit a new refund request (authenticated customers only).
     */
    @PostMapping
    public ResponseEntity<Refund> submit(@Valid @RequestBody RefundRequest req) {
        return ResponseEntity.ok(service.submit(req));
    }

    /*
      GET /api/refunds/customer/{customerId}
      List all refunds for a specific customer (owner or ADMIN).
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Refund>> getByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(service.getByCustomer(customerId));
    }

    /*
      GET /api/refunds/{id}
      Get a single refund by its MongoDB document ID.
      Returns 404 Not Found when the id is unknown (BE-046).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Refund> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /*
      PATCH /api/refunds/{id}/status
      Update refund status – ADMIN role required (BE-041).
      Invalid status values are rejected with 400 (BE-044).
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Refund> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(service.updateStatus(id, req));
    }

    /*
      DELETE /api/refunds/{id}
      Cancel (delete) a PENDING refund.
      Returns 204 No Content on success (BE-045).
      Returns 404 if the refund does not exist.
      Returns 400 if the refund is not in PENDING state.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
