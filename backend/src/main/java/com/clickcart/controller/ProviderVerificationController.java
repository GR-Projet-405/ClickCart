package com.clickcart.controller;

import com.clickcart.dto.ProviderResponseDto;
import com.clickcart.dto.RejectionRequestDto;
import com.clickcart.service.CloudinaryService;
import com.clickcart.service.ProviderVerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/providers")
@CrossOrigin(origins = "*")
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
            String newStatus = statusUpdate.get("status");
            ProviderResponseDto updatedProvider = verificationService.updateProviderStatus(id, newStatus);
            return ResponseEntity.ok(updatedProvider);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Provider Reject කිරීම සඳහා Endpoint එක
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectProvider(
            @PathVariable("id") String id,
            @RequestBody RejectionRequestDto rejectDto) {
        try {
            ProviderResponseDto updatedProvider = verificationService.rejectProvider(id, rejectDto);
            return ResponseEntity.ok(updatedProvider);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/upload-documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProviderDocuments(
            @RequestParam("providerId") String providerId,
            @RequestParam("documents") MultipartFile[] files) {
        try {
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

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Upload failed: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}