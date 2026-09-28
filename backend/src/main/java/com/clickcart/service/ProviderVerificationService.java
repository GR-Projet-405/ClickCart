package com.clickcart.service;

import com.clickcart.dto.ProviderResponseDto;
import com.clickcart.dto.RejectionRequestDto;
import com.clickcart.model.Provider;
import com.clickcart.repository.ProviderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProviderVerificationService {

    private final ProviderRepository providerRepository;
    private final EmailService emailService;

    public ProviderVerificationService(ProviderRepository providerRepository, EmailService emailService) {
        this.providerRepository = providerRepository;
        this.emailService = emailService;
    }

    public List<ProviderResponseDto> getAllVerifications() {
        return providerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProviderResponseDto updateProviderStatus(String providerId, String newStatus) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found with ID: " + providerId));

        provider.setStatus(newStatus.toUpperCase());
        Provider updatedProvider = providerRepository.save(provider);
        return mapToDto(updatedProvider);
    }

    public ProviderResponseDto rejectProvider(String providerId, RejectionRequestDto rejectDto) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found with ID: " + providerId));

        provider.setStatus("REJECTED");
        Provider updatedProvider = providerRepository.save(provider);

        boolean sendEmailFlag = (rejectDto != null && rejectDto.isSendEmail());

        if (sendEmailFlag && provider.getEmail() != null && !provider.getEmail().trim().isEmpty()) {
            try {
                String name = (provider.getOwnerName() != null && !provider.getOwnerName().trim().isEmpty()) 
                        ? provider.getOwnerName() 
                        : provider.getBusinessName();

                emailService.sendRejectionEmail(
                        provider.getEmail(),
                        name,
                        rejectDto.getReasons(),
                        rejectDto.getComments()
                );
                System.out.println("Successfully triggered rejection email to: " + provider.getEmail());
            } catch (Exception e) {
                System.err.println("Failed to send rejection email: " + e.getMessage());
            }
        } else {
            System.out.println("Email not sent: sendEmail flag is false or provider email is missing.");
        }

        return mapToDto(updatedProvider);
    }

    public void saveProviderDocuments(String providerId, List<Map<String, String>> documentList) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found with ID: " + providerId));

        List<Provider.DocumentItem> docs = documentList.stream().map(map -> 
            new Provider.DocumentItem(map.get("type"), map.get("url"))
        ).collect(Collectors.toList());

        provider.setDocuments(docs);
        providerRepository.save(provider);
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