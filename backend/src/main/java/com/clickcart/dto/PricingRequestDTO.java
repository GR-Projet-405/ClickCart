package com.clickcart.dto;

import com.clickcart.model.PricingModel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PricingRequestDTO {

    @NotNull(message = "Pricing model is required")
    private PricingModel pricingModel;

    @Min(value = 0, message = "Price cannot be negative")
    private Double basePrice;

    // Getters and Setters
    public PricingModel getPricingModel() { return pricingModel; }
    public void setPricingModel(PricingModel pricingModel) { this.pricingModel = pricingModel; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }
}
