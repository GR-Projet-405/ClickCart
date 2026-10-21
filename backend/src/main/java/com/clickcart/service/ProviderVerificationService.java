package com.clickcart.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
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

    private static final List<String> ALLOWED_STATUSES = Arrays.asList("PENDING", "APPROVED", "REJECTED", "DRAFT");

    private final ProviderRepository providerRepository;
    private final ProviderVerificationRepository verificationRepository;
    private final EmailService emailService;
    @org.springframework.beans.factory.annotation.Autowired private com.clickcart.repository.UserRepository users;

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

        if ("PENDING".equals(verification.getStatus()) || "APPROVED".equals(verification.getStatus())) throw new IllegalArgumentException("Your documents are under review. Wait for the review before editing.");
        if (!java.util.Set.of("INDIVIDUAL", "BUSINESS").contains(request.accountType() == null ? "" : request.accountType())) throw new IllegalArgumentException("Select Individual or Business");
        if (java.util.stream.Stream.of(request.fullName(), request.nicNumber(), request.personalAddress(), request.contactNumber()).anyMatch(v -> v == null || v.isBlank())) throw new IllegalArgumentException("Name, NIC number, address and contact number are required");
        if ("BUSINESS".equals(request.accountType()) && java.util.stream.Stream.of(request.businessName(), request.brnNumber(), request.businessAddress(), request.businessContactNumber()).anyMatch(v -> v == null || v.isBlank())) throw new IllegalArgumentException("Complete all business registration details");
        verification.setStatus("DRAFT");
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
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("Provider ID cannot be empty");
        }

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

        if (users != null) list.forEach(dto -> users.findById(dto.getId()).ifPresent(user -> dto.setEmail(user.getEmail())));
        return list;
    }

    public ProviderResponseDto updateProviderStatus(String providerId, String newStatus) {
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be empty");
        }

        String formattedStatus = newStatus.trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(formattedStatus)) {
            throw new IllegalArgumentException("Invalid status value: '" + newStatus + "'. Allowed values are: " + ALLOWED_STATUSES);
        }

        Optional<ProviderVerification> submitted = verificationRepository.findByUserId(providerId);
        if ("APPROVED".equals(formattedStatus)) {
            ProviderVerification record = submitted.orElseThrow(() -> new IllegalArgumentException("Verification must be submitted first"));
            if (!"PENDING".equals(record.getStatus()) || !hasRequiredDocuments(record)) throw new IllegalArgumentException("Only a complete pending submission can be approved");
        }
        Optional<Provider> providerOpt = providerRepository.findById(providerId);
        ProviderResponseDto dto = null;

        if (providerOpt.isPresent()) {
            Provider provider = providerOpt.get();
            provider.setStatus(formattedStatus);
            dto = mapToDto(providerRepository.save(provider));
        }

        Optional<ProviderVerification> verificationOpt = verificationRepository.findByUserId(providerId);
        if (verificationOpt.isPresent()) {
            ProviderVerification v = verificationOpt.get();
            v.setStatus(formattedStatus);
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
        if (rejectDto == null || ((rejectDto.getReasons() == null || rejectDto.getReasons().isEmpty()) && (rejectDto.getComments() == null || rejectDto.getComments().isBlank()))) throw new IllegalArgumentException("Provide a reason for rejection");
        ProviderResponseDto dto = updateProviderStatus(providerId, "REJECTED");
        verificationRepository.findByUserId(providerId).ifPresent(v -> {
            v.setRejectionReasons(rejectDto.getReasons()); v.setRejectionComments(rejectDto.getComments());
            verificationRepository.save(v);
        });

        if (users != null) users.findById(providerId).ifPresent(user -> dto.setEmail(user.getEmail()));
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

    public boolean hasRequiredDocuments(ProviderVerification verification) {
        java.util.Set<String> types = verification.getDocuments() == null ? java.util.Set.of()
            : verification.getDocuments().stream().filter(d -> d.getUrl() != null && !d.getUrl().isBlank()).map(ProviderVerification.DocumentItem::getType).collect(java.util.stream.Collectors.toSet());
        return types.contains("NIC_FRONT") && types.contains("NIC_BACK") && (!"BUSINESS".equals(verification.getAccountType()) || types.contains("BUSINESS_CERTIFICATE"));
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