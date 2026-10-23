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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.clickcart.dto.ProviderResponseDto;
import com.clickcart.dto.RejectionRequestDto;
import com.clickcart.service.CloudinaryService;
import com.clickcart.service.ProviderVerificationService;

@RestController
@RequestMapping("/api/admin/providers")
public class ProviderVerificationController {

    private final ProviderVerificationService verificationService;
    private final CloudinaryService cloudinaryService;

    public ProviderVerificationController(ProviderVerificationService verificationService, CloudinaryService cloudinaryService) {
        this.verificationService = verificationService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<ProviderResponseDto>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateProviderStatus(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            if (statusUpdate == null || !statusUpdate.containsKey("status")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Status field is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Provider status cannot be empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            ProviderResponseDto updatedProvider = verificationService.updateProviderStatus(id, newStatus);
            return ResponseEntity.ok(updatedProvider);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectProvider(
            @PathVariable("id") String id,
            @RequestBody RejectionRequestDto rejectDto) {
        try {
            ProviderResponseDto updatedProvider = verificationService.rejectProvider(id, rejectDto);
            return ResponseEntity.ok(updatedProvider);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/upload-documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProviderDocuments(
            @RequestParam(value = "providerId", required = false) String providerId,
            @RequestParam("documents") MultipartFile[] files) {
        try {
            if (providerId == null || providerId.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Required request parameter 'providerId' is missing or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            if (files == null || files.length == 0) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No document files provided for upload");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            List<Map<String, String>> documentList = new ArrayList<>();

            for (MultipartFile file : files) {
                String uploadedUrl = cloudinaryService.uploadFile(file);

                Map<String, String> docObj = new HashMap<>();
                String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

                docObj.put("type", fileName.contains("nic") ? "info" : "purple");
                docObj.put("url", uploadedUrl);

                documentList.add(docObj);
            }

            verificationService.saveProviderDocuments(providerId, documentList);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Documents uploaded and saved to MongoDB successfully!");
            response.put("documents", documentList);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}