package com.clickcart.repository;

import com.clickcart.model.EarningStatus;
import com.clickcart.model.ProviderEarning;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderEarningRepository extends MongoRepository<ProviderEarning, String> {

    List<ProviderEarning> findByProviderId(String providerId);

    Page<ProviderEarning> findByProviderId(String providerId, Pageable pageable);

    List<ProviderEarning> findByProviderIdAndStatus(String providerId, EarningStatus status);

    Page<ProviderEarning> findByProviderIdAndStatus(String providerId, EarningStatus status, Pageable pageable);

    Optional<ProviderEarning> findByIdAndProviderId(String id, String providerId);

    Optional<ProviderEarning> findByBookingId(String bookingId);

    Optional<ProviderEarning> findByTransactionId(String transactionId);

    List<ProviderEarning> findByProviderIdAndCreatedAtBetween(String providerId, Instant start, Instant end);

    Page<ProviderEarning> findByProviderIdAndCreatedAtBetween(String providerId, Instant start, Instant end, Pageable pageable);

    long countByProviderIdAndStatus(String providerId, EarningStatus status);
}
