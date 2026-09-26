package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "service_listings")
public class ServiceListing {
    @Id
    private String id;
    private String providerId;
    private String title;
    private String category;
    private String description;
    private String priceFrom;
    private String priceTo;
    private String priceUnit;
    private String imageUrl;
    private String status;
    private double lat;
    private double lng;
    private String locationName;
    private String providerName;
    private double rating;
    private int reviewsCount;

    public ServiceListing() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriceFrom() { return priceFrom; }
    public void setPriceFrom(String priceFrom) { this.priceFrom = priceFrom; }

    public String getPriceTo() { return priceTo; }
    public void setPriceTo(String priceTo) { this.priceTo = priceTo; }

    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }
}
