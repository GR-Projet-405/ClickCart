package com.clickcart.config;

import java.time.Instant;
import java.util.List;
import com.clickcart.model.ServiceArea;
import com.clickcart.model.ServiceAreaStatus;
import com.clickcart.repository.ServiceAreaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ServiceAreaDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ServiceAreaDataInitializer.class);
    private final ServiceAreaRepository serviceAreaRepository;

    public ServiceAreaDataInitializer(ServiceAreaRepository serviceAreaRepository) {
        this.serviceAreaRepository = serviceAreaRepository;
    }

    @Override
    public void run(String... args) {
        String defaultProviderId = "dev-provider-09";

        if (serviceAreaRepository.countByProviderIdAndArchivedFalse(defaultProviderId) == 0) {
            log.info("Seeding initial reference service areas for provider: {}", defaultProviderId);

            List<ServiceArea> seedAreas = List.of(
                    createArea(defaultProviderId, "Western Province", "Colombo", "00100", 10.0, 6.9271, 79.8612, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Western Province", "Maharagama", "10280", 15.0, 6.8480, 79.9265, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Central Province", "Kandy", "20000", 20.0, 7.2906, 80.6337, ServiceAreaStatus.INACTIVE),
                    createArea(defaultProviderId, "Western Province", "Gampaha", "13100", 12.0, 7.0840, 79.9939, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Western Province", "Negombo", "11500", 10.0, 7.2008, 79.8736, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Southern Province", "Matara", "81000", 18.0, 5.9549, 80.5550, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Southern Province", "Galle", "80000", 15.0, 6.0535, 80.2210, ServiceAreaStatus.INACTIVE),
                    createArea(defaultProviderId, "Northern Province", "Jaffna", "40000", 25.0, 9.6615, 80.0255, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Western Province", "Dehiwala", "10350", 10.0, 6.8344, 79.8705, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Western Province", "Battaramulla", "10120", 10.0, 6.8997, 79.9221, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Western Province", "Nugegoda", "10250", 8.0, 6.8724, 79.8997, ServiceAreaStatus.ACTIVE),
                    createArea(defaultProviderId, "Western Province", "Moratuwa", "10400", 7.0, 6.7730, 79.8816, ServiceAreaStatus.ACTIVE)
            );

            serviceAreaRepository.saveAll(seedAreas);
            log.info("Initialized 12 reference service areas matching project specification.");
        }
    }

    private ServiceArea createArea(String providerId, String district, String city, String postal, double radius,
                                   double lat, double lon, ServiceAreaStatus status) {
        ServiceArea area = new ServiceArea();
        area.setProviderId(providerId);
        area.setDistrict(district);
        area.setCityName(city);
        area.setPostalCode(postal);
        area.setRadiusKm(radius);
        area.setLatitude(lat);
        area.setLongitude(lon);
        area.setLocationName(city + ", " + district + ", Sri Lanka");
        area.setStatus(status);
        area.setActive(status == ServiceAreaStatus.ACTIVE);
        area.setArchived(false);
        area.setCreatedAt(Instant.now());
        area.setUpdatedAt(Instant.now());
        return area;
    }
}
