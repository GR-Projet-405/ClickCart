package com.clickcart.service;

import com.clickcart.dto.PricingRequestDTO;
import com.clickcart.dto.PricingResponseDTO;
import com.clickcart.exception.InvalidPricingException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.PricingModel;
import com.clickcart.model.ServicePricing;
import com.clickcart.repository.ServicePricingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class PricingServiceImpl implements PricingService {

    @Autowired
    private ServicePricingRepository pricingRepository;

    @Override
    public PricingResponseDTO saveOrUpdatePricing(String serviceId, PricingRequestDTO requestDTO) {
        // 1. Validation: Ensure price is not negative
        if (requestDTO.getBasePrice() != null && requestDTO.getBasePrice() < 0) {
            throw new InvalidPricingException("Base price cannot be negative");
        }

        // 2. Check if pricing already exists for this service
        ServicePricing pricing = pricingRepository.findByServiceId(serviceId).orElse(new ServicePricing());

        // 3. Update fields
        pricing.setServiceId(serviceId);
        pricing.setPricingModel(requestDTO.getPricingModel());
        pricing.setBasePrice(requestDTO.getBasePrice());
        pricing.setUpdatedAt(LocalDateTime.now());

        // 4. Save to database
        ServicePricing savedPricing = pricingRepository.save(pricing);

        // 5. Convert to DTO and return
        return convertToResponseDTO(savedPricing);
    }

    @Override
    public PricingResponseDTO getPricingByServiceId(String serviceId) {
        ServicePricing pricing = pricingRepository.findByServiceId(serviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Pricing not found for service: " + serviceId));
        return convertToResponseDTO(pricing);
    }

    // Helper method to map Entity to DTO
    private PricingResponseDTO convertToResponseDTO(ServicePricing pricing) {
        PricingResponseDTO dto = new PricingResponseDTO();
        dto.setId(pricing.getId());
        dto.setServiceId(pricing.getServiceId());
        dto.setPricingModel(pricing.getPricingModel());
        dto.setBasePrice(pricing.getBasePrice());
        dto.setCurrency(pricing.getCurrency());
        dto.setCreatedAt(pricing.getCreatedAt());
        dto.setUpdatedAt(pricing.getUpdatedAt());
        return dto;
    }
}
