package com.clickcart.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "provider_profiles")
public class ProviderProfile {

    @Id
    private String id;

    private String providerType; // "individual" or "business"
    private String fullName;
    private String businessName;
    private String contactPerson;
    private String email;
    private String phone;
    private String location;
    private String bio;
    private String profileImage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProviderProfile() {
    }

    public ProviderProfile(String id, String providerType, String fullName, String businessName,
                           String contactPerson, String email, String phone, String location,
                           String bio, String profileImage, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.providerType = providerType;
        this.fullName = fullName;
        this.businessName = businessName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.location = location;
        this.bio = bio;
        this.profileImage = profileImage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProviderType() {
        return providerType;
    }

    public void setProviderType(String providerType) {
        this.providerType = providerType;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
