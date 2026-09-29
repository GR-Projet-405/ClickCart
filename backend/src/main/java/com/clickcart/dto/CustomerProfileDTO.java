package com.clickcart.dto;

import java.util.List;

import com.clickcart.model.Customer;

/**
 * Data Transfer Object for returning customer profile data to frontend.
 */
public class CustomerProfileDTO {

    private String id;
    private String fullName;
    private String preferredName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String memberSince;
    private String bio;
    private String location;
    private String dateOfBirth;
    private String gender;
    private String preferredLanguage;
    private String defaultCurrency;
    private String timezone;
    private String emergencyContact;
    private Customer.Verification verification;
    private Customer.Stats stats;
    private List<Customer.Address> savedAddresses;
    private List<Customer.Activity> recentActivities;

    public CustomerProfileDTO() {
    }

    public static CustomerProfileDTO fromEntity(Customer customer) {
        if (customer == null) {
            return null;
        }
        CustomerProfileDTO dto = new CustomerProfileDTO();
        dto.setId(customer.getId());
        dto.setFullName(customer.getFullName());
        dto.setPreferredName(customer.getPreferredName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAvatarUrl(customer.getAvatarUrl());
        dto.setMemberSince(customer.getMemberSince());
        dto.setBio(customer.getBio());
        dto.setLocation(customer.getLocation());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setGender(customer.getGender());
        dto.setPreferredLanguage(customer.getPreferredLanguage());
        dto.setDefaultCurrency(customer.getDefaultCurrency());
        dto.setTimezone(customer.getTimezone());
        dto.setEmergencyContact(customer.getEmergencyContact());
        dto.setVerification(customer.getVerification());
        dto.setStats(customer.getStats());
        dto.setSavedAddresses(customer.getSavedAddresses());
        dto.setRecentActivities(customer.getRecentActivities());
        return dto;
    }

    // --- Getters & Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPreferredName() { return preferredName; }
    public void setPreferredName(String preferredName) { this.preferredName = preferredName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getMemberSince() { return memberSince; }
    public void setMemberSince(String memberSince) { this.memberSince = memberSince; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public Customer.Verification getVerification() { return verification; }
    public void setVerification(Customer.Verification verification) { this.verification = verification; }

    public Customer.Stats getStats() { return stats; }
    public void setStats(Customer.Stats stats) { this.stats = stats; }

    public List<Customer.Address> getSavedAddresses() { return savedAddresses; }
    public void setSavedAddresses(List<Customer.Address> savedAddresses) { this.savedAddresses = savedAddresses; }

    public List<Customer.Activity> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<Customer.Activity> recentActivities) { this.recentActivities = recentActivities; }
}
