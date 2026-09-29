package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
}
