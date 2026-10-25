package com.clickcart.repository;

import com.clickcart.model.ServicePackage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicePackageRepository extends MongoRepository<ServicePackage, String> {

    // Fetch all packages belonging to a specific service
    List<ServicePackage> findByServiceId(String serviceId);

    // Delete all packages for a specific service (useful for cleanup)
    void deleteByServiceId(String serviceId);
}
