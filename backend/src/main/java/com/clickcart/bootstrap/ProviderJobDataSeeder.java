package com.clickcart.bootstrap;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.clickcart.model.JobDiagnostic;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.repository.ProviderJobRepository;

@Component
public class ProviderJobDataSeeder implements CommandLineRunner {

    public static final String PROVIDER_A = "provider-a";
    public static final String PROVIDER_B = "provider-b";
    private static final ZoneId ZONE = ZoneId.of("Asia/Colombo");

    private final ProviderJobRepository repository;

    public ProviderJobDataSeeder(ProviderJobRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        List<ProviderJob> jobs = new ArrayList<>();
        ZonedDateTime now = ZonedDateTime.now(ZONE);
        LocalDate today = now.toLocalDate();

        jobs.add(inProgressAcJob(today, now));
        jobs.add(enRouteElectricalJob(today));
        jobs.add(placedLeadJob(today));
        jobs.add(upcomingFilter(today.plusDays(1), "CC-9011", "Split AC Gas Top-up", "Nimal F.", "No. 12, Park Street, Colombo 02", 4500));
        jobs.add(upcomingFilter(today.plusDays(2), "CC-9018", "Cassette AC Chemical Wash", "Ishara M.", "88 Bauddhaloka Mawatha, Colombo 07", 7800));
        jobs.add(acceptedTomorrow(today.plusDays(1)));

        jobs.add(completed(today.minusDays(1), "CC-8701", "HVAC", "Window AC Service", 5500, 1));
        jobs.add(completed(today.minusDays(1), "CC-8702", "ELECTRICAL", "Socket Circuit Repair", 3200, 1));
        jobs.add(completed(today.minusDays(2), "CC-8710", "HVAC", "AC Filter Replacement", 4100, 2));
        jobs.add(completed(today.minusDays(3), "CC-8722", "ELECTRICAL", "DB Board Tightening", 4800, 3));
        jobs.add(completed(today.minusDays(3), "CC-8728", "HVAC", "Outdoor Coil Rinse", 3600, 3));
        jobs.add(completed(today.minusDays(4), "CC-8733", "HVAC", "Inverter Diagnostic", 6200, 4));
        jobs.add(completed(today.minusDays(5), "CC-8740", "ELECTRICAL", "Lighting Circuit Check", 2900, 5));
        jobs.add(completed(today.minusDays(5), "CC-8744", "HVAC", "Ducted AC Inspection", 8100, 5));
        jobs.add(completed(today.minusDays(6), "CC-8751", "HVAC", "Gas Leak Trace", 5400, 6));
        jobs.add(completed(today.minusDays(6), "CC-8756", "ELECTRICAL", "Earthing Repair", 3900, 6));

        jobs.add(foreignProviderJob());
        repository.saveAll(jobs);
    }

    private ProviderJob inProgressAcJob(LocalDate today, ZonedDateTime now) {
        ProviderJob job = base(PROVIDER_A, "JOB-8492", "CC-8921", JobStatus.IN_PROGRESS);
        job.setServiceTitle("AC Repair & Master Servicing (Inverter 1.5HP)");
        job.setServiceCategory("HVAC");
        job.setPackageName("Full Package");
        job.setSlaLabel("Standard Residential SLA");
        job.setCustomerId("CL-8402");
        job.setCustomerName("Kavinda Silva");
        job.setCustomerPhone("+94 77 123 4567");
        job.setCustomerRating(4.9);
        job.setCustomerPreviousBookings(14);
        job.setCustomerVerified(true);
        job.setCustomerMemberArea("Colombo 03 Member");
        job.setAddress("No. 45/2, Alfred House Gardens, Galle Road, Colombo 03");
        job.setCity("Colombo");
        job.setLatitude(6.8992);
        job.setLongitude(79.8570);
        job.setMapAreaLabel("Colombo");
        job.setDistanceKm(3.2);
        job.setAccessInstructions(
            "Please ring the front gate bell twice, our pet retriever is inside the front garden. Service ladder is accessible beside the garage."
        );
        job.setPlacedAt(at(today, 10, 15).minusHours(5).toInstant());
        job.setAcceptedAt(at(today, 10, 30).minusHours(4).toInstant());
        job.setStartedAt(now.minusMinutes(95).toInstant());
        job.setScheduledStart(at(today, 14, 30).toInstant());
        job.setScheduledEnd(at(today, 16, 0).toInstant());
        job.setPaymentHold("ESCROW");
        job.setServiceBaseFee(6000.0);
        job.setPartsTopUp(1500.0);
        job.setPlatformCommission(750.0);
        job.setNetPayout(6750.0);
        job.setFuelAllowance(2400.0);
        job.setProgressLabel("Step 3 of 4: Chemical Wash & Condenser Coil Flush");
        job.setProgressPercent(75);
        job.setDiagnostics(List.of(
            new JobDiagnostic("High-Pressure Blower & Coil Wash", "Chemical spray foaming on condenser & evaporator matrix to dissolve debris."),
            new JobDiagnostic("R410A Refrigerant Pressure Check", "Baseline psi test; verified suction pressure holding at nominal 125 PSI."),
            new JobDiagnostic("Drain Line Vacuum Flush", "Unclogged secondary condensate trap and verified direct drain slope."),
            new JobDiagnostic("Electrical Terminals & Amperage Test", "Inspected inverter run capacitor and compressor thermal relay.")
        ));
        job.setChecklist(List.of(
            "Customer reviewed indoor airflow and confirmed completion",
            "Homeowner verified cooling return vent temperature reached 17°C during test cycle.",
            "Work Area Cleaning & Waste Removed",
            "All plastic drainage sheets removed, floor cleaned, and garden gate secured."
        ));
        job.setCompletionNotes(
            "AC servicing complete. High pressure water wash executed on outdoor unit. Recharged 200g of R410a refrigerant to balance optimal cooling pressure. Fan blower lubricated. System operating at whisper quiet 34dB sound level."
        );
        return job;
    }

    private ProviderJob enRouteElectricalJob(LocalDate today) {
        ProviderJob job = base(PROVIDER_A, "JOB-8501", "CC-8940", JobStatus.ACCEPTED);
        job.setServiceTitle("Emergency Electrical DB Board Inspection");
        job.setServiceCategory("ELECTRICAL");
        job.setPackageName("Safety Inspection");
        job.setSlaLabel("Emergency SLA");
        job.setCustomerId("CL-5521");
        job.setCustomerName("Dilani Perera");
        job.setCustomerPhone("+94 71 555 0190");
        job.setCustomerRating(4.8);
        job.setCustomerPreviousBookings(6);
        job.setCustomerVerified(true);
        job.setCustomerMemberArea("Colombo 05 Member");
        job.setAddress("28/4 Havelock Place, Colombo 05");
        job.setCity("Colombo");
        job.setLatitude(6.8910);
        job.setLongitude(79.8605);
        job.setMapAreaLabel("Havelock Town");
        job.setDistanceKm(2.4);
        job.setEtaMinutes(15);
        job.setTransitNote("Moderate traffic on Baseline Rd. Customer notified of incoming technician transit.");
        job.setAccessInstructions("Call on arrival. Security will open the side gate.");
        job.setPlacedAt(at(today, 8, 10).toInstant());
        job.setAcceptedAt(at(today, 8, 22).toInstant());
        job.setScheduledStart(at(today, 16, 0).toInstant());
        job.setScheduledEnd(at(today, 17, 0).toInstant());
        job.setPaymentHold("CASH_ON_DELIVERY");
        job.setServiceBaseFee(4200.0);
        job.setPartsTopUp(0.0);
        job.setPlatformCommission(420.0);
        job.setNetPayout(4200.0);
        job.setProgressLabel("En route");
        job.setProgressPercent(35);
        job.setDiagnostics(List.of(
            new JobDiagnostic("Main breaker thermal scan", "Check for overload heating on the incoming isolator."),
            new JobDiagnostic("RCD trip test", "Verify residual current device disconnects within spec.")
        ));
        return job;
    }

    private ProviderJob placedLeadJob(LocalDate today) {
        ProviderJob job = base(PROVIDER_A, "JOB-8510", "CC-8977", JobStatus.PLACED);
        job.setServiceTitle("AC Master Servicing & Filter Cleaning");
        job.setServiceCategory("HVAC");
        job.setPackageName("Standard Service");
        job.setSlaLabel("2h Window");
        job.setCustomerId("CL-2209");
        job.setCustomerName("Shanilka D.");
        job.setCustomerPhone("+94 76 441 2088");
        job.setCustomerRating(4.6);
        job.setCustomerPreviousBookings(3);
        job.setCustomerVerified(false);
        job.setCustomerMemberArea("Colombo 07");
        job.setAddress("Ward Place, Colombo 07");
        job.setCity("Colombo");
        job.setLatitude(6.9100);
        job.setLongitude(79.8640);
        job.setMapAreaLabel("Cinnamon Gardens");
        job.setDistanceKm(4.1);
        job.setAccessInstructions("Slots fill up quickly. Confirm access with the concierge desk.");
        job.setPlacedAt(ZonedDateTime.now(ZONE).minusMinutes(42).toInstant());
        job.setScheduledStart(at(today, 15, 30).toInstant());
        job.setScheduledEnd(at(today, 17, 30).toInstant());
        job.setPaymentHold("PREAUTHORIZED");
        job.setServiceBaseFee(6500.0);
        job.setPartsTopUp(0.0);
        job.setPlatformCommission(650.0);
        job.setNetPayout(6500.0);
        job.setProgressLabel("Awaiting provider accept");
        job.setProgressPercent(10);
        job.setDiagnostics(List.of(
            new JobDiagnostic("Indoor filter inspection", "Remove, wash, and reseat return filters."),
            new JobDiagnostic("Drain pan check", "Confirm condensate flow after cleaning.")
        ));
        return job;
    }

    private ProviderJob upcomingFilter(
        LocalDate day,
        String code,
        String title,
        String customer,
        String address,
        double payout
    ) {
        ProviderJob job = base(PROVIDER_A, code.replace("CC", "JOB"), code, JobStatus.ACCEPTED);
        job.setServiceTitle(title);
        job.setServiceCategory("HVAC");
        job.setPackageName("Residential");
        job.setSlaLabel("Standard Residential SLA");
        job.setCustomerName(customer);
        job.setCustomerPhone("+94 77 200 1100");
        job.setCustomerVerified(true);
        job.setCustomerMemberArea("Colombo");
        job.setAddress(address);
        job.setCity("Colombo");
        job.setLatitude(6.9271);
        job.setLongitude(79.8612);
        job.setScheduledStart(at(day, 9, 0).toInstant());
        job.setScheduledEnd(at(day, 11, 0).toInstant());
        job.setAcceptedAt(at(day.minusDays(1), 18, 0).toInstant());
        job.setPlacedAt(at(day.minusDays(1), 12, 0).toInstant());
        job.setPaymentHold("ESCROW");
        job.setServiceBaseFee(payout);
        job.setPartsTopUp(0.0);
        job.setPlatformCommission(payout * 0.1);
        job.setNetPayout(payout);
        job.setProgressLabel("Scheduled");
        job.setProgressPercent(40);
        return job;
    }

    private ProviderJob acceptedTomorrow(LocalDate day) {
        ProviderJob job = base(PROVIDER_A, "JOB-8600", "CC-9055", JobStatus.ACCEPTED);
        job.setServiceTitle("Water Heater Wiring Diagnostic");
        job.setServiceCategory("ELECTRICAL");
        job.setPackageName("Residential");
        job.setCustomerName("Nugegoda Residence");
        job.setAddress("Nugegoda");
        job.setCity("Nugegoda");
        job.setLatitude(6.8649);
        job.setLongitude(79.8997);
        job.setScheduledStart(at(day, 16, 30).toInstant());
        job.setScheduledEnd(at(day, 17, 30).toInstant());
        job.setPlacedAt(at(day.minusDays(1), 9, 0).toInstant());
        job.setAcceptedAt(at(day.minusDays(1), 9, 20).toInstant());
        job.setPaymentHold("ESCROW");
        job.setServiceBaseFee(5100.0);
        job.setNetPayout(5100.0);
        job.setProgressLabel("Scheduled");
        job.setProgressPercent(40);
        return job;
    }

    private ProviderJob completed(LocalDate day, String code, String category, String title, double payout, int daysAgo) {
        ProviderJob job = base(PROVIDER_A, code.replace("CC", "JOB"), code, JobStatus.COMPLETED);
        job.setServiceTitle(title);
        job.setServiceCategory(category);
        job.setCustomerName("Completed Client");
        job.setAddress("Colombo");
        job.setCity("Colombo");
        job.setLatitude(6.9271);
        job.setLongitude(79.8612);
        ZonedDateTime start = at(day, 10, 0);
        job.setScheduledStart(start.toInstant());
        job.setScheduledEnd(start.plusHours(2).toInstant());
        job.setPlacedAt(start.minusDays(1).toInstant());
        job.setAcceptedAt(start.minusHours(20).toInstant());
        job.setStartedAt(start.toInstant());
        job.setCompletedAt(start.plusHours(2).toInstant());
        job.setPaymentHold("ESCROW");
        job.setServiceBaseFee(payout);
        job.setPartsTopUp(0.0);
        job.setPlatformCommission(payout * 0.1);
        job.setNetPayout(payout);
        job.setProgressLabel("Completed");
        job.setProgressPercent(100);
        job.setCompletionNotes("Work completed and signed off.");
        return job;
    }

    private ProviderJob foreignProviderJob() {
        ProviderJob job = base(PROVIDER_B, "JOB-B-100", "CC-B100", JobStatus.IN_PROGRESS);
        job.setServiceTitle("Provider B Confidential Repair");
        job.setServiceCategory("HVAC");
        job.setCustomerName("Private Client B");
        job.setAddress("Kandy");
        job.setCity("Kandy");
        job.setScheduledStart(ZonedDateTime.now(ZONE).toInstant());
        job.setNetPayout(9900.0);
        job.setPaymentHold("ESCROW");
        job.setProgressPercent(50);
        job.setAccessInstructions("Should never be visible to provider A.");
        return job;
    }

    private static ProviderJob base(String providerId, String publicCode, String bookingCode, JobStatus status) {
        ProviderJob job = new ProviderJob();
        job.setProviderId(providerId);
        job.setPublicCode(publicCode);
        job.setBookingCode(bookingCode);
        job.setStatus(status);
        java.time.Instant now = java.time.Instant.now();
        job.setCreatedAt(now);
        job.setUpdatedAt(now);
        return job;
    }

    private static ZonedDateTime at(LocalDate day, int hour, int minute) {
        return ZonedDateTime.of(day, LocalTime.of(hour, minute), ZONE);
    }
}
