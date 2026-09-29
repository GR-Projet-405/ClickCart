package com.clickcart.controller;

import com.clickcart.dto.PricingRequestDTO;
import com.clickcart.dto.PricingResponseDTO;
import com.clickcart.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/providers/services/{serviceId}/pricing")
public class PricingController {

    @Autowired
    private PricingService pricingService;

    // POST: Create or Update pricing for a service
    @PostMapping
    public ResponseEntity<PricingResponseDTO> saveOrUpdatePricing(
        @PathVariable String serviceId,
        @Valid @RequestBody PricingRequestDTO requestDTO) {

        PricingResponseDTO response = pricingService.saveOrUpdatePricing(serviceId, requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET: Retrieve pricing for a specific service
    @GetMapping
    public ResponseEntity<PricingResponseDTO> getPricingByServiceId(
        @PathVariable String serviceId) {

        PricingResponseDTO response = pricingService.getPricingByServiceId(serviceId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
