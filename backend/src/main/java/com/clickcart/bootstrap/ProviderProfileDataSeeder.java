package com.clickcart.bootstrap;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.clickcart.model.ProviderProfile;
import com.clickcart.repository.ProviderProfileRepository;

@Component
public class ProviderProfileDataSeeder implements CommandLineRunner {

    public static final String PROVIDER_A = "provider-a";
    public static final String PROVIDER_B = "provider-b";

    private final ProviderProfileRepository repository;

    public ProviderProfileDataSeeder(ProviderProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        List<ProviderProfile> profiles = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Provider A profile
        ProviderProfile profileA = new ProviderProfile();
        profileA.setId(PROVIDER_A);
        profileA.setProviderType("individual");
        profileA.setFullName("CoolBreeze Air Conditioning");
        profileA.setEmail("coolbreeze@example.com");
        profileA.setPhone("+94 77 123 4567");
        profileA.setLocation("Colombo, Sri Lanka");
        profileA.setBio("Professional HVAC services including AC installation, repair, and maintenance. 10+ years of experience.");
        profileA.setServiceCategory("HVAC");
        profileA.setRating(4.8);
        profileA.setReviewCount(24);
        profileA.setStartingPrice(4500.0);
        profileA.setVerified(true);
        profileA.setCreatedAt(now);
        profileA.setUpdatedAt(now);
        profiles.add(profileA);

        // Provider B profile
        ProviderProfile profileB = new ProviderProfile();
        profileB.setId(PROVIDER_B);
        profileB.setProviderType("business");
        profileB.setBusinessName("QuickFix Electrical Services");
        profileB.setContactPerson("Dilani Perera");
        profileB.setEmail("quickfix@example.com");
        profileB.setPhone("+94 71 555 0190");
        profileB.setLocation("Kandy, Sri Lanka");
        profileB.setBio("Emergency electrical services, DB board inspections, and residential wiring.");
        profileB.setServiceCategory("ELECTRICAL");
        profileB.setRating(4.6);
        profileB.setReviewCount(18);
        profileB.setStartingPrice(3200.0);
        profileB.setVerified(true);
        profileB.setCreatedAt(now);
        profileB.setUpdatedAt(now);
        profiles.add(profileB);

        repository.saveAll(profiles);
    }
}
