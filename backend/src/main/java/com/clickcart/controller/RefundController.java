package com.clickcart.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
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
@CrossOrigin(origins = "*")
public class RefundController {

    private final RefundService service;

    public RefundController(RefundService service) {
        this.service = service;
    }

    /*
      POST /api/refunds
      Submit a new refund request.
     */
    @PostMapping
    public ResponseEntity<Refund> submit(@Valid @RequestBody RefundRequest req) {
        return ResponseEntity.ok(service.submit(req));
    }

    /*
      GET /api/refunds/customer/{customerId}
      List all refunds for a specific customer.
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Refund>> getByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(service.getByCustomer(customerId));
    }

    /*
      GET /api/refunds/{id}
      Get a single refund by its MongoDB document ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Refund> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /*
      PATCH /api/refunds/{id}/status
      Update refund status (admin / internal).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Refund> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(service.updateStatus(id, req));
    }

    /*
      DELETE /api/refunds/{id}
      Cancel (delete) a PENDING refund.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable String id) {
        service.cancel(id);
        return ResponseEntity.ok(Map.of("message", "Refund cancelled successfully"));
    }
}
