package com.clickcart.controller;
import com.clickcart.dto.ProviderVerificationRequest;
import com.clickcart.security.CurrentProvider;
import com.clickcart.service.ProviderVerificationService;
import com.clickcart.service.VerificationDocumentStorage;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.io.IOException;

@RestController
@RequestMapping("/api/provider-verification")
public class ProviderSubmissionController {
    private final ProviderVerificationService service;
    private final VerificationDocumentStorage documents;
    public ProviderSubmissionController(ProviderVerificationService service, VerificationDocumentStorage documents) {
        this.service = service; this.documents = documents;
    }
    @GetMapping
    public ResponseEntity<?> getVerification() {
        return service.getByUserId(CurrentProvider.id()).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/step1")
    public Object saveStepOne(@RequestBody ProviderVerificationRequest request) {
        return service.saveStepOne(CurrentProvider.id(), request);
    }
    @PostMapping(value = "/step2", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Object saveStepTwo(@RequestParam("nicFront") MultipartFile front, @RequestParam("nicBack") MultipartFile back,
            @RequestParam(value = "businessCert", required = false) MultipartFile certificate) throws IOException {
        String providerId = CurrentProvider.id();
        var verification = service.getByUserId(providerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Save your identity details first"));
        if ("PENDING".equals(verification.getStatus()) || "APPROVED".equals(verification.getStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT, "This submission is already under review or approved");
        documents.validate(front); documents.validate(back);
        if ("BUSINESS".equals(verification.getAccountType())) documents.validate(certificate);
        List<Map<String, String>> uploaded = new ArrayList<>();
        try {
            uploaded.add(Map.of("type", "NIC_FRONT", "url", documents.store(providerId, "NIC_FRONT", front)));
            uploaded.add(Map.of("type", "NIC_BACK", "url", documents.store(providerId, "NIC_BACK", back)));
            if ("BUSINESS".equals(verification.getAccountType())) uploaded.add(Map.of("type", "BUSINESS_CERTIFICATE", "url", documents.store(providerId, "BUSINESS_CERTIFICATE", certificate)));
            service.saveProviderDocuments(providerId, uploaded);
        } catch (IOException | RuntimeException error) {
            uploaded.forEach(item -> documents.remove(item.get("url")));
            throw error;
        }
        return service.getByUserId(providerId).orElseThrow();
    }
    @GetMapping("/documents/{id}")
    public ResponseEntity<byte[]> document(@PathVariable String id, Authentication authentication) throws IOException {
        var file = documents.read(id, authentication);
        try (var input = file.getInputStream()) {
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(input.readAllBytes());
        }
    }
}
