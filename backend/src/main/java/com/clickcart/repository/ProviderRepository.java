package com.clickcart.repository;

import com.clickcart.model.Provider;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProviderRepository extends MongoRepository<Provider, String> {
    List<Provider> findByStatus(String status);
}