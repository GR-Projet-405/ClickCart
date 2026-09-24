package com.clickcart.service;

import com.clickcart.dto.PackageRequestDTO;
import com.clickcart.dto.PackageResponseDTO;
import com.clickcart.exception.InvalidPricingException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.ServicePackage;
import com.clickcart.repository.ServicePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackageServiceImpl implements PackageService {

    @Autowired
    private ServicePackageRepository packageRepository;

    @Override
    public PackageResponseDTO createPackage(String serviceId, PackageRequestDTO requestDTO) {
        ServicePackage newPackage = new ServicePackage();
        newPackage.setServiceId(serviceId);
        newPackage.setPackageName(requestDTO.getPackageName());
        newPackage.setDescription(requestDTO.getDescription());
        newPackage.setPrice(requestDTO.getPrice());
        newPackage.setDurationMinutes(requestDTO.getDurationMinutes());

        ServicePackage savedPackage = packageRepository.save(newPackage);
        return convertToResponseDTO(savedPackage);
    }

    @Override
    public List<PackageResponseDTO> getPackagesByServiceId(String serviceId) {
        return packageRepository.findByServiceId(serviceId).stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PackageResponseDTO updatePackage(String packageId, String serviceId, PackageRequestDTO requestDTO) {
        // Security Check: Ensure the package belongs to the requested service
        ServicePackage existingPackage = packageRepository.findById(packageId)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));

        if (!existingPackage.getServiceId().equals(serviceId)) {
            throw new InvalidPricingException("Package does not belong to the specified service");
        }

        // Update fields
        existingPackage.setPackageName(requestDTO.getPackageName());
        existingPackage.setDescription(requestDTO.getDescription());
        existingPackage.setPrice(requestDTO.getPrice());
        existingPackage.setDurationMinutes(requestDTO.getDurationMinutes());
        existingPackage.setUpdatedAt(LocalDateTime.now());

        ServicePackage updatedPackage = packageRepository.save(existingPackage);
        return convertToResponseDTO(updatedPackage);
    }

    @Override
    public void deletePackage(String packageId, String serviceId) {
        // Security Check
        ServicePackage existingPackage = packageRepository.findById(packageId)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));

        if (!existingPackage.getServiceId().equals(serviceId)) {
            throw new InvalidPricingException("Package does not belong to the specified service");
        }

        packageRepository.delete(existingPackage);
    }

    // Helper method to map Entity to DTO
    private PackageResponseDTO convertToResponseDTO(ServicePackage pkg) {
        PackageResponseDTO dto = new PackageResponseDTO();
        dto.setId(pkg.getId());
        dto.setServiceId(pkg.getServiceId());
        dto.setPackageName(pkg.getPackageName());
        dto.setDescription(pkg.getDescription());
        dto.setPrice(pkg.getPrice());
        dto.setDurationMinutes(pkg.getDurationMinutes());
        dto.setCreatedAt(pkg.getCreatedAt());
        dto.setUpdatedAt(pkg.getUpdatedAt());
        return dto;
    }
}
