package com.clickcart.repository;

import java.util.List;
import java.util.Optional;
import com.clickcart.model.ServiceArea;
import com.clickcart.model.ServiceAreaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceAreaRepository extends MongoRepository<ServiceArea, String> {

    Optional<ServiceArea> findByIdAndArchivedFalse(String id);

    Page<ServiceArea> findByProviderIdAndArchivedFalse(String providerId, Pageable pageable);

    List<ServiceArea> findByProviderIdAndArchivedFalse(String providerId);

    long countByProviderIdAndArchivedFalse(String providerId);

    long countByProviderIdAndStatusAndArchivedFalse(String providerId, ServiceAreaStatus status);

    boolean existsByProviderIdAndDistrictIgnoreCaseAndCityNameIgnoreCaseAndArchivedFalse(
            String providerId, String district, String cityName);

    @Query("{ 'district': { $regex: ?0, $options: 'i' }, 'cityName': { $regex: ?1, $options: 'i' }, 'status': 'ACTIVE', 'archived': false }")
    List<ServiceArea> findActiveByDistrictAndCity(String district, String cityName);
}
