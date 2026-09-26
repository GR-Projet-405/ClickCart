package com.clickcart.dto;

import java.util.List;

import com.clickcart.model.Customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for profile update requests.
 */
public class CustomerProfileUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Size(max = 50, message = "Preferred name cannot exceed 50 characters")
    private String preferredName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^\\+?[0-9\\s\\-()]{7,20}$",
        message = "Please provide a valid phone number (7 to 20 digits, optional country code)"
    )
    private String phone;

    private String avatarUrl;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @Pattern(
        regexp = "^(\\d{4}-\\d{2}-\\d{2})?$",
        message = "Date of birth must be in YYYY-MM-DD format"
    )
    private String dateOfBirth;

    @Pattern(
        regexp = "^(Male|Female|Non-binary|Prefer not to say|Other)?$",
        message = "Gender must be one of: Male, Female, Non-binary, Prefer not to say, Other"
    )
    private String gender;

    private String preferredLanguage;
    private String defaultCurrency;
    private String timezone;
    private String emergencyContact;
    private List<Customer.Address> savedAddresses;

    public CustomerProfileUpdateRequest() {
    }

    // --- Getters & Setters ---

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

    public List<Customer.Address> getSavedAddresses() { return savedAddresses; }
    public void setSavedAddresses(List<Customer.Address> savedAddresses) { this.savedAddresses = savedAddresses; }
}
