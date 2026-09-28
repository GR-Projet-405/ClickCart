package com.clickcart.controller;

import java.security.Principal;
import com.clickcart.dto.ApiResponse;
import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceAreaRequest;
import com.clickcart.dto.ServiceAreaResponse;
import com.clickcart.dto.ServiceAreaStatusRequest;
import com.clickcart.dto.ServiceAreaSummaryResponse;
import com.clickcart.service.ServiceAreaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/provider/service-areas")
@PreAuthorize("hasRole('SERVICE_PROVIDER')")
public class ServiceAreaController {

    private final ServiceAreaService serviceAreaService;

    public ServiceAreaController(ServiceAreaService serviceAreaService) {
        this.serviceAreaService = serviceAreaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ServiceAreaResponse>>> listServiceAreas(
            Principal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        String providerId = getProviderId(principal);
        PagedResponse<ServiceAreaResponse> response =
                serviceAreaService.getServiceAreas(providerId, search, status, district, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ServiceAreaSummaryResponse>> getSummary(Principal principal) {
        String providerId = getProviderId(principal);
        ServiceAreaSummaryResponse summary = serviceAreaService.getSummary(providerId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> getServiceAreaById(
            Principal principal,
            @PathVariable String id) {
        String providerId = getProviderId(principal);
        ServiceAreaResponse response = serviceAreaService.getServiceAreaById(providerId, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> createServiceArea(
            Principal principal,
            @Valid @RequestBody ServiceAreaRequest request) {
        String providerId = getProviderId(principal);
        ServiceAreaResponse created = serviceAreaService.createServiceArea(providerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Service area created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> updateServiceArea(
            Principal principal,
            @PathVariable String id,
            @Valid @RequestBody ServiceAreaRequest request) {
        String providerId = getProviderId(principal);
        ServiceAreaResponse updated = serviceAreaService.updateServiceArea(providerId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Service area updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> updateStatus(
            Principal principal,
            @PathVariable String id,
            @RequestBody ServiceAreaStatusRequest statusRequest) {
        String providerId = getProviderId(principal);
        ServiceAreaResponse updated = serviceAreaService.updateStatus(providerId, id, statusRequest);
        return ResponseEntity.ok(ApiResponse.ok("Service area status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteServiceArea(
            Principal principal,
            @PathVariable String id) {
        String providerId = getProviderId(principal);
        serviceAreaService.archiveServiceArea(providerId, id);
        return ResponseEntity.ok(ApiResponse.ok("Service area deleted successfully", null));
    }

    private String getProviderId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return "dev-provider-09";
        }
        return principal.getName();
    }
}
