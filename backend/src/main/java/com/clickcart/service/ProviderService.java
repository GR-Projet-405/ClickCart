package com.clickcart.service;

import com.clickcart.model.Provider;
import com.clickcart.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProviderService {

    @Autowired
    private ProviderRepository providerRepository;

    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    public Optional<Provider> getProviderById(String id) {
        return providerRepository.findById(id);
    }

    public List<Provider> getProvidersByCategory(String category) {
        return providerRepository.findByCategory(category);
    }

    public Provider saveProvider(Provider provider) {
        return providerRepository.save(provider);
    }
}
