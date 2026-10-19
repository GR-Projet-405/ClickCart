package com.clickcart.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clickcart.dto.ProviderResponseDto;
import com.clickcart.dto.ProviderVerificationRequest;
import com.clickcart.dto.RejectionRequestDto;
import com.clickcart.model.Provider;
import com.clickcart.model.ProviderVerification;
import com.clickcart.repository.ProviderRepository;
import com.clickcart.repository.ProviderVerificationRepository;

@Service
public class ProviderVerificationService {

    private final ProviderRepository providerRepository;
    private final ProviderVerificationRepository verificationRepository;
    private final EmailService emailService;

    public ProviderVerificationService(
            ProviderRepository providerRepository,
            ProviderVerificationRepository verificationRepository,
            EmailService emailService) {
        this.providerRepository = providerRepository;
        this.verificationRepository = verificationRepository;
        this.emailService = emailService;
    }

    public ProviderVerification saveStepOne(String userId, ProviderVerificationRequest request) {
        ProviderVerification verification = verificationRepository.findByUserId(userId)
                .orElseGet(ProviderVerification::new);

        verification.setUserId(userId);
        verification.setAccountType(request.accountType() != null ? request.accountType() : "INDIVIDUAL");
        verification.setFullName(request.fullName());
        verification.setNicNumber(request.nicNumber());
        verification.setPersonalAddress(request.personalAddress());
        verification.setContactNumber(request.contactNumber());

        verification.setBusinessName(request.businessName());
        verification.setBrnNumber(request.brnNumber());
        verification.setBusinessAddress(request.businessAddress());
        verification.setBusinessContactNumber(request.businessContactNumber());

        if (verification.getStatus() == null) {
            verification.setStatus("DRAFT");
        }

        Instant now = Instant.now();
        if (verification.getCreatedAt() == null) {
            verification.setCreatedAt(now);
        }
        verification.setUpdatedAt(now);

        return verificationRepository.save(verification);
    }

    public Optional<ProviderVerification> getByUserId(String userId) {
        return verificationRepository.findByUserId(userId);
    }

    public void saveProviderDocuments(String userId, List<Map<String, String>> documentList) {
        boolean recordFound = false;

        Optional<ProviderVerification> verificationOpt = verificationRepository.findByUserId(userId);
        if (verificationOpt.isPresent()) {
            ProviderVerification verification = verificationOpt.get();
            List<ProviderVerification.DocumentItem> docs = documentList.stream().map(map -> 
                new ProviderVerification.DocumentItem(map.get("type"), map.get("url"))
            ).collect(Collectors.toList());

            verification.setDocuments(docs);
            verification.setStatus("PENDING");
            verification.setUpdatedAt(Instant.now());
            verificationRepository.save(verification);
            recordFound = true;
        }

        Optional<Provider> providerOpt = providerRepository.findById(userId);
        if (providerOpt.isEmpty()) {
            providerOpt = providerRepository.findAll().stream()
                    .filter(p -> userId.equals(p.getId()))
                    .findFirst();
        }

        if (providerOpt.isPresent()) {
            Provider provider = providerOpt.get();
            List<Provider.DocumentItem> docs = documentList.stream().map(map -> 
                new Provider.DocumentItem(map.get("type"), map.get("url"))
            ).collect(Collectors.toList());

            provider.setDocuments(docs);
            provider.setStatus("PENDING");
            providerRepository.save(provider);
            recordFound = true;
        }

        if (!recordFound) {
            ProviderVerification newVerification = new ProviderVerification();
            newVerification.setUserId(userId);
            newVerification.setStatus("PENDING");
            newVerification.setCreatedAt(Instant.now());
            newVerification.setUpdatedAt(Instant.now());
            List<ProviderVerification.DocumentItem> docs = documentList.stream().map(map -> 
                new ProviderVerification.DocumentItem(map.get("type"), map.get("url"))
            ).collect(Collectors.toList());

            newVerification.setDocuments(docs);
            verificationRepository.save(newVerification);
        }
    }

    public List<ProviderResponseDto> getAllVerifications() {
        List<ProviderResponseDto> list = new ArrayList<>();

        List<Provider> providers = providerRepository.findAll();
        for (Provider provider : providers) {
            list.add(mapToDto(provider));
        }

        List<ProviderVerification> verifications = verificationRepository.findAll();
        for (ProviderVerification v : verifications) {
            String targetId = v.getUserId() != null ? v.getUserId() : v.getId();

            Optional<ProviderResponseDto> existingDto = list.stream()
                    .filter(dto -> dto.getId() != null && dto.getId().equals(targetId))
                    .findFirst();

            if (existingDto.isPresent()) {
                ProviderResponseDto dto = existingDto.get();
                if (v.getStatus() != null) dto.setStatus(v.getStatus());
                if (v.getFullName() != null && !v.getFullName().isEmpty()) dto.setOwnerName(v.getFullName());
                if (v.getBusinessName() != null && !v.getBusinessName().isEmpty()) dto.setBusinessName(v.getBusinessName());
                if (v.getContactNumber() != null && !v.getContactNumber().isEmpty()) dto.setPhone(v.getContactNumber());
                if (v.getAccountType() != null && !v.getAccountType().isEmpty()) dto.setProviderType(v.getAccountType());
                if (v.getCreatedAt() != null) dto.setCreatedAt(v.getCreatedAt().toString());
                if (v.getDocuments() != null && !v.getDocuments().isEmpty()) {
                    dto.setDocuments(v.getDocuments().stream()
                            .map(doc -> new ProviderResponseDto.DocumentDto(doc.getType(), doc.getUrl()))
                            .collect(Collectors.toList()));
                }
            } else {
                ProviderResponseDto dto = new ProviderResponseDto();
                dto.setId(targetId);
                dto.setOwnerName(v.getFullName());
                dto.setBusinessName(v.getBusinessName());
                dto.setPhone(v.getContactNumber());
                dto.setProviderType(v.getAccountType());
                dto.setStatus(v.getStatus() != null ? v.getStatus() : "PENDING");
                dto.setCreatedAt(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null);
                if (v.getDocuments() != null) {
                    dto.setDocuments(v.getDocuments().stream()
                            .map(doc -> new ProviderResponseDto.DocumentDto(doc.getType(), doc.getUrl()))
                            .collect(Collectors.toList()));
                }
                list.add(dto);
            }
        }

        return list;
    }

    public ProviderResponseDto updateProviderStatus(String providerId, String newStatus) {
        Optional<Provider> providerOpt = providerRepository.findById(providerId);
        ProviderResponseDto dto = null;

        if (providerOpt.isPresent()) {
            Provider provider = providerOpt.get();
            provider.setStatus(newStatus.toUpperCase());
            dto = mapToDto(providerRepository.save(provider));
        }

        Optional<ProviderVerification> verificationOpt = verificationRepository.findByUserId(providerId);
        if (verificationOpt.isPresent()) {
            ProviderVerification v = verificationOpt.get();
            v.setStatus(newStatus.toUpperCase());
            v.setUpdatedAt(Instant.now());
            verificationRepository.save(v);

            if (dto == null) {
                dto = new ProviderResponseDto();
                dto.setId(v.getUserId());
                dto.setOwnerName(v.getFullName());
                dto.setBusinessName(v.getBusinessName());
                dto.setPhone(v.getContactNumber());
                dto.setProviderType(v.getAccountType());
                dto.setStatus(v.getStatus());
                dto.setCreatedAt(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null);
            }
        }

        if (dto == null) {
            throw new RuntimeException("Provider verification record not found for ID: " + providerId);
        }

        return dto;
    }

    public ProviderResponseDto rejectProvider(String providerId, RejectionRequestDto rejectDto) {
        ProviderResponseDto dto = updateProviderStatus(providerId, "REJECTED");

        boolean sendEmailFlag = (rejectDto != null && rejectDto.isSendEmail());
        if (sendEmailFlag && dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            try {
                String name = dto.getOwnerName() != null ? dto.getOwnerName() : dto.getBusinessName();
                emailService.sendRejectionEmail(
                        dto.getEmail(),
                        name,
                        rejectDto.getReasons(),
                        rejectDto.getComments()
                );
            } catch (Exception e) {
                System.err.println("Failed to send rejection email: " + e.getMessage());
            }
        }

        return dto;
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
        dto.setAvatar(provider.getAvatar()); 
        
        if (provider.getDocuments() != null) {
            dto.setDocuments(provider.getDocuments().stream()
                    .map(doc -> new ProviderResponseDto.DocumentDto(doc.getType(), doc.getUrl()))
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}