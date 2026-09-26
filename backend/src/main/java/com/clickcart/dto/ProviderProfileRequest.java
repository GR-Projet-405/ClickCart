package com.clickcart.dto;

public class ProviderProfileRequest {

    private String providerType;
    private String fullName;
    private String businessName;
    private String contactPerson;
    private String email;
    private String phone;
    private String location;
    private String bio;
    private String profileImage;

    public ProviderProfileRequest() {
    }

    public ProviderProfileRequest(String providerType, String fullName, String businessName,
                                  String contactPerson, String email, String phone,
                                  String location, String bio, String profileImage) {
        this.providerType = providerType;
        this.fullName = fullName;
        this.businessName = businessName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.location = location;
        this.bio = bio;
        this.profileImage = profileImage;
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
}
