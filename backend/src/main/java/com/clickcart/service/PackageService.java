package com.clickcart.service;

import com.clickcart.dto.PackageRequestDTO;
import com.clickcart.dto.PackageResponseDTO;
import java.util.List;

public interface PackageService {

    PackageResponseDTO createPackage(String serviceId, PackageRequestDTO requestDTO);
    List<PackageResponseDTO> getPackagesByServiceId(String serviceId);
    PackageResponseDTO updatePackage(String packageId, String serviceId, PackageRequestDTO requestDTO);
    void deletePackage(String packageId, String serviceId);
}
