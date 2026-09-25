package com.clickcart.controller;

import com.clickcart.dto.PackageRequestDTO;
import com.clickcart.dto.PackageResponseDTO;
import com.clickcart.service.PackageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/providers/services/{serviceId}/packages")
public class PackageController {

    @Autowired
    private PackageService packageService;

    // POST: Create a new package
    @PostMapping
    public ResponseEntity<PackageResponseDTO> createPackage(
        @PathVariable String serviceId,
        @Valid @RequestBody PackageRequestDTO requestDTO) {

        PackageResponseDTO response = packageService.createPackage(serviceId, requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET: Get all packages for a service
    @GetMapping
    public ResponseEntity<List<PackageResponseDTO>> getPackagesByServiceId(
        @PathVariable String serviceId) {

        List<PackageResponseDTO> response = packageService.getPackagesByServiceId(serviceId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // PUT: Update an existing package
    @PutMapping("/{packageId}")
    public ResponseEntity<PackageResponseDTO> updatePackage(
        @PathVariable String serviceId,
        @PathVariable String packageId,
        @Valid @RequestBody PackageRequestDTO requestDTO) {

        PackageResponseDTO response = packageService.updatePackage(packageId, serviceId, requestDTO);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // DELETE: Remove a package
    @DeleteMapping("/{packageId}")
    public ResponseEntity<Void> deletePackage(
        @PathVariable String serviceId,
        @PathVariable String packageId) {

        packageService.deletePackage(packageId, serviceId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
