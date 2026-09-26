package com.clickcart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ServiceListingRequest;
import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.dto.ServiceListingStatusRequest;
import com.clickcart.service.ServiceListingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/provider/services")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@Validated
public class ServiceListingController {

    private final ServiceListingService service;

    public ServiceListingController(ServiceListingService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceListingResponse> list(
        @RequestParam @NotBlank String providerId
    ) {
        return service.findForProvider(providerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceListingResponse create(
        @RequestParam @NotBlank String providerId,
        @Valid @RequestBody ServiceListingRequest request
    ) {
        return service.create(providerId, request);
    }

    @PutMapping("/{id}")
    public ServiceListingResponse update(
        @PathVariable String id,
        @RequestParam @NotBlank String providerId,
        @Valid @RequestBody ServiceListingRequest request
    ) {
        return service.update(providerId, id, request);
    }

    @PatchMapping("/{id}/status")
    public ServiceListingResponse updateStatus(
        @PathVariable String id,
        @RequestParam @NotBlank String providerId,
        @Valid @RequestBody ServiceListingStatusRequest request
    ) {
        return service.updateStatus(providerId, id, request.status());
    }
}
