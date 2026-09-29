package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "providers")
public class Provider {

    @Id
    private String id;

    // Fields from feature/DEV-05 (Admin Verification)
    private String businessName;
    private String ownerName;
    private String email;
    private String phone;
    private String providerType;
    private String status;
    private String createdAt;
    private String avatar;
    private List<DocumentItem> documents;

    // Fields from dev branch (UI & Map Features)
    private String name;
    private boolean verified;

@Document(collection = "providers")
public class Provider {
    
    @Id
    private String id;
    
    private String name;
    private boolean verified;
    private String category;
    private double rating;
    private int reviewsCount;
    private String locationName;
    private double startingPrice;
    private String imageUrl;
    private String initials;
    private String color;
    private double lat;
    private double lng;

    // Shared Fields
    private String category;

    public Provider() {
    }

    // Constructor from dev branch (Kept to avoid breaking existing dev code)
    public Provider(String name, boolean verified, String category, double rating, int reviewsCount,
            String locationName, double startingPrice, String imageUrl, String initials, String color, double lat,
            double lng) {
    public Provider() {}

    public Provider(String name, boolean verified, String category, double rating, int reviewsCount, String locationName, double startingPrice, String imageUrl, String initials, String color, double lat, double lng) {
        this.name = name;
        this.verified = verified;
        this.category = category;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.locationName = locationName;
        this.startingPrice = startingPrice;
        this.imageUrl = imageUrl;
        this.initials = initials;
        this.color = color;
        this.lat = lat;
        this.lng = lng;
    }

    // Getters and Setters for all fields
    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
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

    public String getProviderType() {
        return providerType;
    }

    public void setProviderType(String providerType) {
        this.providerType = providerType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public List<DocumentItem> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentItem> documents) {
        this.documents = documents;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(int reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public double getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(double startingPrice) {
        this.startingPrice = startingPrice;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    // Inner Class from feature/DEV-05
    public static class DocumentItem {
        private String type;
        private String url;

        public DocumentItem() {
        }

        public DocumentItem(String type, String url) {
            this.type = type;
            this.url = url;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }
}
}
