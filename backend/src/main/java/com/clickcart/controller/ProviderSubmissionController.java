package com.clickcart.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.clickcart.dto.ProviderVerificationRequest;
import com.clickcart.model.ProviderVerification;
import com.clickcart.service.CloudinaryService;
import com.clickcart.service.ProviderVerificationService;

@RestController
@RequestMapping("/api/provider-verification")
@CrossOrigin(origins = "*")
public class ProviderSubmissionController {

    private final ProviderVerificationService service;
    private final CloudinaryService cloudinaryService;

    public ProviderSubmissionController(ProviderVerificationService service, CloudinaryService cloudinaryService) {
        this.service = service;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/step1")
    public ResponseEntity<?> saveStepOne(
            @RequestParam(value = "userId", defaultValue = "user_demo_1") String userId,
            @RequestBody ProviderVerificationRequest request) {
        try {
            ProviderVerification saved = service.saveStepOne(userId, request);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/step2", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveStepTwo(
            @RequestParam("userId") String userId,
            @RequestParam("nicFront") MultipartFile nicFront,
            @RequestParam("nicBack") MultipartFile nicBack,
            @RequestParam(value = "businessCert", required = false) MultipartFile businessCert) {
        try {
            List<Map<String, String>> documentList = new ArrayList<>();

            if (nicFront != null && !nicFront.isEmpty()) {
                String nicFrontUrl = cloudinaryService.uploadFile(nicFront);
                Map<String, String> frontDoc = new HashMap<>();
                frontDoc.put("type", "NIC_FRONT");
                frontDoc.put("url", nicFrontUrl);
                documentList.add(frontDoc);
            }

            if (nicBack != null && !nicBack.isEmpty()) {
                String nicBackUrl = cloudinaryService.uploadFile(nicBack);
                Map<String, String> backDoc = new HashMap<>();
                backDoc.put("type", "NIC_BACK");
                backDoc.put("url", nicBackUrl);
                documentList.add(backDoc);
            }

            if (businessCert != null && !businessCert.isEmpty()) {
                String businessCertUrl = cloudinaryService.uploadFile(businessCert);
                Map<String, String> certDoc = new HashMap<>();
                certDoc.put("type", "BUSINESS_CERTIFICATE");
                certDoc.put("url", businessCertUrl);
                documentList.add(certDoc);
            }

            service.saveProviderDocuments(userId, documentList);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Documents uploaded and submitted successfully!");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getVerification(@RequestParam(value = "userId", defaultValue = "user_demo_1") String userId) {
        return service.getByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}