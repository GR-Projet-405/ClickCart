package com.clickcart.repository;

import com.clickcart.model.BlockedDate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BlockedDateRepository extends MongoRepository<BlockedDate, String> {

    List<BlockedDate> findByProviderId(String providerId);

    List<BlockedDate> findByProviderIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            String providerId,
            LocalDate endDate,
            LocalDate startDate
    );
}