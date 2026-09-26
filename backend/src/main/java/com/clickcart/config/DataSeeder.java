package com.clickcart.config;

import com.clickcart.model.Provider;
import com.clickcart.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Autowired
    private ProviderRepository providerRepository;

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            providerRepository.deleteAll(); // Clear existing mock data
            
            Provider p1 = new Provider("CleanMaster Services", true, "Cleaning", 4.9, 128, "Negombo, Sri Lanka", 1500, null, "CM", "#1ABA1A", 7.2008, 79.8737);
            Provider p2 = new Provider("Salon Elegance", true, "Beauty & Salon", 4.8, 95, "Kandy, Sri Lanka", 2000, null, "SE", "#7C3AED", 7.2906, 80.6337);
            Provider p3 = new Provider("QuickFix Plumbing", false, "Plumbing", 4.7, 67, "Colombo, Sri Lanka", 2200, null, "QP", "#0369A1", 6.9271, 79.8612);
            Provider p4 = new Provider("CoolBreeze AC Repair", true, "AC Repair", 4.6, 45, "Galle, Sri Lanka", 3000, null, "CB", "#B45309", 6.0328, 80.2150);
            Provider p5 = new Provider("PowerPro Electricals", true, "Electrical", 4.9, 112, "Jaffna, Sri Lanka", 1200, null, "PP", "#DC2626", 9.6615, 80.0255);
            Provider p6 = new Provider("Sparkle Cleaning Co.", false, "Cleaning", 4.5, 38, "Matara, Sri Lanka", 1400, null, "SC", "#0D9488", 5.9496, 80.5353);
            
            providerRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));
            System.out.println("Real providers seeded into database.");
        };
    }
}
