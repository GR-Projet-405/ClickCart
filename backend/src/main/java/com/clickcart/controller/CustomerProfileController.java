package com.clickcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.CustomerProfileDTO;
import com.clickcart.dto.CustomerProfileUpdateRequest;
import com.clickcart.service.CustomerProfileService;
import com.clickcart.util.CurrentCustomerResolver;

import jakarta.validation.Valid;

/**
 * Controller handling Customer Profile endpoints.
 * 
 * Endpoints:
 * - GET /api/customers/me/profile
 * - PUT /api/customers/me/profile
 * 
 * NOTE FOR AUTHENTICATION TEAM:
 * The current customer identity is resolved via CurrentCustomerResolver.
 * Once authentication is implemented, CurrentCustomerResolver will extract
 * the authenticated user's ID from the security context without needing to
 * change these endpoint routes or contracts.
 */
@RestController
@RequestMapping("/api/customers/me/profile")
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;
    private final CurrentCustomerResolver currentCustomerResolver;

    public CustomerProfileController(
            CustomerProfileService customerProfileService,
            CurrentCustomerResolver currentCustomerResolver) {
        this.customerProfileService = customerProfileService;
        this.currentCustomerResolver = currentCustomerResolver;
    }

    /**
     * Get profile of the currently logged-in / active customer.
     * 
     * @return CustomerProfileDTO
     */
    @GetMapping
    public ResponseEntity<CustomerProfileDTO> getMyProfile() {
        String customerId = currentCustomerResolver.getCurrentCustomerId();
        CustomerProfileDTO profile = customerProfileService.getCustomerProfile(customerId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update profile of the currently logged-in / active customer.
     * 
     * @param request CustomerProfileUpdateRequest
     * @return Updated CustomerProfileDTO
     */
    @PutMapping
    public ResponseEntity<CustomerProfileDTO> updateMyProfile(
            @Valid @RequestBody CustomerProfileUpdateRequest request) {
        String customerId = currentCustomerResolver.getCurrentCustomerId();
        CustomerProfileDTO updatedProfile = customerProfileService.updateCustomerProfile(customerId, request);
        return ResponseEntity.ok(updatedProfile);
    }
}
