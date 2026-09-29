package com.clickcart.service;

import com.clickcart.dto.PricingRequestDTO;
import com.clickcart.dto.PricingResponseDTO;

public interface PricingService {

    // Save new pricing or update existing pricing for a service
    PricingResponseDTO saveOrUpdatePricing(String serviceId, PricingRequestDTO requestDTO);

    // Get pricing details for a specific service
    PricingResponseDTO getPricingByServiceId(String serviceId);
}
