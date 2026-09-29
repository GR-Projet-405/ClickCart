package com.clickcart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;

public interface ProviderJobRepository extends MongoRepository<ProviderJob, String> {

    List<ProviderJob> findByProviderIdOrderByScheduledStartAsc(String providerId);

    List<ProviderJob> findByProviderIdAndStatusOrderByScheduledStartAsc(String providerId, JobStatus status);

    Optional<ProviderJob> findByIdAndProviderId(String id, String providerId);
}
