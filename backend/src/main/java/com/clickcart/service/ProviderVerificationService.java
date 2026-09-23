package com.clickcart.service;

import com.clickcart.dto.ProviderResponseDto;
import com.clickcart.model.Provider;
import com.clickcart.repository.ProviderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProviderVerificationService {

    private final ProviderRepository providerRepository;

    public ProviderVerificationService(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    public List<ProviderResponseDto> getAllVerifications() {
        return providerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ProviderResponseDto mapToDto(Provider provider) {
        ProviderResponseDto dto = new ProviderResponseDto();
        dto.setId(provider.getId());
        dto.setBusinessName(provider.getBusinessName());
        dto.setOwnerName(provider.getOwnerName());
        dto.setEmail(provider.getEmail());
        dto.setPhone(provider.getPhone());
        dto.setProviderType(provider.getProviderType()); 
        dto.setCategory(provider.getCategory());
        dto.setStatus(provider.getStatus());
        dto.setCreatedAt(provider.getCreatedAt());
        
        if (provider.getDocuments() != null) {
            dto.setDocuments(provider.getDocuments().stream()
                    .map(doc -> new ProviderResponseDto.DocumentDto(doc.getType(), doc.getUrl()))
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}