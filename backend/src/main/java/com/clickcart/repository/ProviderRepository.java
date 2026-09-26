package com.clickcart.repository;

import com.clickcart.model.Provider;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderRepository extends MongoRepository<Provider, String> {
    List<Provider> findByCategory(String category);
}
