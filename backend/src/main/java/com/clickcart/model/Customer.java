package com.clickcart.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * MongoDB Document representing a Customer Profile in ClickCart.
 */
@Document(collection = "customers")
public class Customer {

    @Id
    private String id; // e.g. "mock-customer-001" or ObjectId

    @Indexed(unique = true)
    private String email;

    private String fullName;
    private String preferredName;
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

    private Verification verification = new Verification();
    private Stats stats = new Stats();
    private List<Address> savedAddresses = new ArrayList<>();
    private List<Activity> recentActivities = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Customer() {
    }

    public Customer(String id, String fullName, String email, String phone) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
    }

    // --- Getters and Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPreferredName() {
        return preferredName;
    }

    public void setPreferredName(String preferredName) {
        this.preferredName = preferredName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(String memberSince) {
        this.memberSince = memberSince;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public Verification getVerification() {
        return verification;
    }

    public void setVerification(Verification verification) {
        this.verification = verification;
    }

    public Stats getStats() {
        return stats;
    }

    public void setStats(Stats stats) {
        this.stats = stats;
    }

    public List<Address> getSavedAddresses() {
        return savedAddresses;
    }

    public void setSavedAddresses(List<Address> savedAddresses) {
        this.savedAddresses = savedAddresses;
    }

    public List<Activity> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<Activity> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // --- Embedded Classes ---

    public static class Verification {
        private String status = "Verified";
        private String level = "Level 2 Verified Customer";
        private String badgeLabel = "Verified Customer";
        private boolean nationalIdVerified = true;
        private boolean emailVerified = true;
        private boolean phoneVerified = true;
        private boolean paymentMethodVerified = true;
        private String verifiedDate = "April 12, 2024";

        public Verification() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }

        public String getBadgeLabel() { return badgeLabel; }
        public void setBadgeLabel(String badgeLabel) { this.badgeLabel = badgeLabel; }

        public boolean isNationalIdVerified() { return nationalIdVerified; }
        public void setNationalIdVerified(boolean nationalIdVerified) { this.nationalIdVerified = nationalIdVerified; }

        public boolean isEmailVerified() { return emailVerified; }
        public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

        public boolean isPhoneVerified() { return phoneVerified; }
        public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }

        public boolean isPaymentMethodVerified() { return paymentMethodVerified; }
        public void setPaymentMethodVerified(boolean paymentMethodVerified) { this.paymentMethodVerified = paymentMethodVerified; }

        public String getVerifiedDate() { return verifiedDate; }
        public void setVerifiedDate(String verifiedDate) { this.verifiedDate = verifiedDate; }
    }

    public static class Stats {
        private int totalBookings = 0;
        private int activeOrders = 0;
        private int completedServices = 0;
        private int favoriteProviders = 0;
        private int loyaltyPoints = 0;
        private String totalSaved = "Rs. 0";

        public Stats() {}

        public int getTotalBookings() { return totalBookings; }
        public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

        public int getActiveOrders() { return activeOrders; }
        public void setActiveOrders(int activeOrders) { this.activeOrders = activeOrders; }

        public int getCompletedServices() { return completedServices; }
        public void setCompletedServices(int completedServices) { this.completedServices = completedServices; }

        public int getFavoriteProviders() { return favoriteProviders; }
        public void setFavoriteProviders(int favoriteProviders) { this.favoriteProviders = favoriteProviders; }

        public int getLoyaltyPoints() { return loyaltyPoints; }
        public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

        public String getTotalSaved() { return totalSaved; }
        public void setTotalSaved(String totalSaved) { this.totalSaved = totalSaved; }
    }

    public static class Address {
        private String id;
        private String label;
        private String type;
        private String recipientName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String postalCode;
        private String province;
        private String country;
        @com.fasterxml.jackson.annotation.JsonProperty("isDefault")
        private boolean isDefault;
        private String notes;

        public Address() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddressLine1() { return addressLine1; }
        public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

        public String getAddressLine2() { return addressLine2; }
        public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public String getProvince() { return province; }
        public void setProvince(String province) { this.province = province; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        @com.fasterxml.jackson.annotation.JsonProperty("isDefault")
        public boolean isDefault() { return isDefault; }
        @com.fasterxml.jackson.annotation.JsonProperty("isDefault")
        public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class Activity {
        private String id;
        private String title;
        private String provider;
        private String date;
        private String status;
        private String statusVariant;
        private String amount;
        private String iconType;
        private Double ratingGiven;

        public Activity() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getStatusVariant() { return statusVariant; }
        public void setStatusVariant(String statusVariant) { this.statusVariant = statusVariant; }

        public String getAmount() { return amount; }
        public void setAmount(String amount) { this.amount = amount; }

        public String getIconType() { return iconType; }
        public void setIconType(String iconType) { this.iconType = iconType; }

        public Double getRatingGiven() { return ratingGiven; }
        public void setRatingGiven(Double ratingGiven) { this.ratingGiven = ratingGiven; }
    }
}
