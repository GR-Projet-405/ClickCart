package com.clickcart.model;

public enum PricingModel {
    FIXED,      // Charge a set amount
    STARTING,   // Set a minimum base price
    HOURLY,     // Charge by the hour
    QUOTE       // Request a custom quote
}
