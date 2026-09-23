package com.clickcart.controller;

import com.clickcart.dto.ProviderResponseDto;
import com.clickcart.service.ProviderVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/providers")
@CrossOrigin(origins = "*")
public class ProviderVerificationController {

    private final ProviderVerificationService verificationService;

    public ProviderVerificationController(ProviderVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<ProviderResponseDto>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }
}