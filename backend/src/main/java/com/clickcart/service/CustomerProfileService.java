package com.clickcart.service;

import org.springframework.stereotype.Service;

import com.clickcart.dto.CustomerProfileDTO;
import com.clickcart.dto.CustomerProfileUpdateRequest;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Customer;
import com.clickcart.repository.CustomerRepository;

@Service
public class CustomerProfileService {

    private final CustomerRepository customerRepository;

    public CustomerProfileService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Retrieve customer profile by customer ID.
     */
    public CustomerProfileDTO getCustomerProfile(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));
        return CustomerProfileDTO.fromEntity(customer);
    }

    /**
     * Update customer profile by customer ID.
     */
    public CustomerProfileDTO updateCustomerProfile(String customerId, CustomerProfileUpdateRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        if (request.getFullName() != null) {
            customer.setFullName(request.getFullName().trim());
        }
        if (request.getPreferredName() != null) {
            customer.setPreferredName(request.getPreferredName().trim());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail().trim());
        }
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null) {
            customer.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getBio() != null) {
            customer.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            customer.setLocation(request.getLocation().trim());
        }
        if (request.getDateOfBirth() != null) {
            customer.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            customer.setGender(request.getGender());
        }
        if (request.getPreferredLanguage() != null) {
            customer.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getDefaultCurrency() != null) {
            customer.setDefaultCurrency(request.getDefaultCurrency());
        }
        if (request.getTimezone() != null) {
            customer.setTimezone(request.getTimezone());
        }
        if (request.getEmergencyContact() != null) {
            customer.setEmergencyContact(request.getEmergencyContact().trim());
        }
        if (request.getSavedAddresses() != null) {
            customer.setSavedAddresses(request.getSavedAddresses());
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return CustomerProfileDTO.fromEntity(updatedCustomer);
    }
}
