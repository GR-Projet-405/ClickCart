package com.clickcart.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.clickcart.dto.CustomerProfileDTO;
import com.clickcart.dto.CustomerProfileUpdateRequest;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Customer;
import com.clickcart.model.User;
import com.clickcart.repository.CustomerRepository;
import com.clickcart.repository.UserRepository;

@Service
public class CustomerProfileService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerProfileService(
            CustomerRepository customerRepository,
            UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    /**
     * Retrieve customer profile by customer ID.
     * Auto-creates customer profile record if user exists in UserRepository.
     */
    public CustomerProfileDTO getCustomerProfile(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .or(() -> customerRepository.findByEmail(customerId))
                .orElseGet(() -> createDefaultCustomerFromUser(customerId));

        return CustomerProfileDTO.fromEntity(customer);
    }

    /**
     * Update customer profile by customer ID.
     */
    public CustomerProfileDTO updateCustomerProfile(String customerId, CustomerProfileUpdateRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .or(() -> customerRepository.findByEmail(customerId))
                .orElseGet(() -> createDefaultCustomerFromUser(customerId));

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

        // Keep User record in sync if name or phone changed
        userRepository.findById(customer.getId()).ifPresent(user -> {
            boolean changed = false;
            if (request.getFullName() != null && !request.getFullName().trim().equals(user.getFullName())) {
                user.setFullName(request.getFullName().trim());
                changed = true;
            }
            if (request.getPhone() != null && !request.getPhone().trim().equals(user.getPhone())) {
                user.setPhone(request.getPhone().trim());
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
        });

        return CustomerProfileDTO.fromEntity(updatedCustomer);
    }

    /**
     * Creates and persists a default Customer profile from a registered User.
     */
    private Customer createDefaultCustomerFromUser(String customerIdOrUserId) {
        User user = userRepository.findById(customerIdOrUserId)
                .or(() -> userRepository.findByEmail(customerIdOrUserId))
                .orElse(null);

        if (user == null) {
            throw new ResourceNotFoundException("Customer profile not found for ID: " + customerIdOrUserId);
        }

        Customer customer = new Customer();
        customer.setId(user.getId());
        customer.setEmail(user.getEmail());
        customer.setFullName(user.getFullName() != null ? user.getFullName() : "Customer");
        
        String[] nameParts = customer.getFullName().trim().split("\\s+");
        customer.setPreferredName(nameParts.length > 0 ? nameParts[0] : "Customer");
        customer.setPhone(user.getPhone() != null ? user.getPhone() : "");
        customer.setAvatarUrl("");
        customer.setMemberSince(LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)));
        customer.setBio("Customer on ClickCart.");
        customer.setLocation("Colombo, Sri Lanka");
        customer.setPreferredLanguage("English (UK)");
        customer.setDefaultCurrency("LKR (Rs.)");
        customer.setTimezone("Asia/Colombo (GMT+5:30)");
        
        Customer.Verification ver = new Customer.Verification();
        ver.setStatus("Active");
        ver.setEmailVerified(true);
        ver.setPhoneVerified(user.getPhone() != null && !user.getPhone().isBlank());
        ver.setBadgeLabel("Verified Customer");
        customer.setVerification(ver);

        customer.setStats(new Customer.Stats());
        customer.setSavedAddresses(new ArrayList<>());
        customer.setRecentActivities(new ArrayList<>());

        return customerRepository.save(customer);
    }
}

