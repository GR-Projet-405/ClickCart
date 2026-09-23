package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "service_pricing")
public class ServicePricing {

    @Id
    private String id;

    // We use String serviceId to work independently of DEV-06's ServiceListing model
    private String serviceId;

    private PricingModel pricingModel;
    private Double basePrice;
    private String currency;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default Constructor
    public ServicePricing() {
        this.currency = "LKR"; // Default currency for Sri Lanka
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Parameterized Constructor
    public ServicePricing(String serviceId, PricingModel pricingModel, Double basePrice) {
        this(); // Calls default constructor to set currency and timestamps
        this.serviceId = serviceId;
        this.pricingModel = pricingModel;
        this.basePrice = basePrice;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public PricingModel getPricingModel() { return pricingModel; }
    public void setPricingModel(PricingModel pricingModel) { this.pricingModel = pricingModel; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
