package com.clickcart.config;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.clickcart.model.Customer;
import com.clickcart.repository.CustomerRepository;
import com.clickcart.util.CurrentCustomerResolver;

/**
 * ============================================================================
 * DEVELOPMENT ONLY - CUSTOMER DATA SEEDER
 * ============================================================================
 * Seeds the MongoDB database with initial mock customer data (mock-customer-001)
 * so that the Customer Profile section can be developed and tested independently
 * before the full authentication system is ready.
 */
@Component
public class CustomerDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CustomerDataSeeder.class);

    private final CustomerRepository customerRepository;

    public CustomerDataSeeder(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public void run(String... args) {
        String mockId = CurrentCustomerResolver.DEV_MOCK_CUSTOMER_ID;

        if (customerRepository.findById(mockId).isEmpty()) {
            log.info("[DEVELOPMENT ONLY] Seeding initial mock customer data for: {}", mockId);

            Customer customer = new Customer();
            customer.setId(mockId);
            customer.setFullName("Kasun Perera");
            customer.setPreferredName("Kasun");
            customer.setEmail("kasun.perera@example.com");
            customer.setPhone("+94 77 123 4567");
            customer.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80");
            customer.setMemberSince("March 2024");
            customer.setBio("Homeowner in Colombo 07. Frequently looking for trusted electrical, plumbing, and garden maintenance services on ClickCart.");
            customer.setLocation("Colombo, Western Province, Sri Lanka");
            customer.setDateOfBirth("1994-06-18");
            customer.setGender("Male");
            customer.setPreferredLanguage("English (UK)");
            customer.setDefaultCurrency("LKR (Rs.)");
            customer.setTimezone("Asia/Colombo (GMT+5:30)");
            customer.setEmergencyContact("+94 71 987 6543 (Wife - Nimalee)");

            // Verification
            Customer.Verification ver = new Customer.Verification();
            ver.setStatus("Verified");
            ver.setLevel("Level 2 Verified Customer");
            ver.setBadgeLabel("Verified Customer");
            ver.setNationalIdVerified(true);
            ver.setEmailVerified(true);
            ver.setPhoneVerified(true);
            ver.setPaymentMethodVerified(true);
            ver.setVerifiedDate("April 12, 2024");
            customer.setVerification(ver);

            // Stats
            Customer.Stats stats = new Customer.Stats();
            stats.setTotalBookings(24);
            stats.setActiveOrders(2);
            stats.setCompletedServices(22);
            stats.setFavoriteProviders(8);
            stats.setLoyaltyPoints(1450);
            stats.setTotalSaved("Rs. 18,500");
            customer.setStats(stats);

            // Addresses
            List<Customer.Address> addresses = new ArrayList<>();

            Customer.Address addr1 = new Customer.Address();
            addr1.setId("addr-1");
            addr1.setLabel("Home (Primary)");
            addr1.setType("Home");
            addr1.setRecipientName("Kasun Perera");
            addr1.setPhone("+94 77 123 4567");
            addr1.setAddressLine1("No. 45/2, Guildford Crescent");
            addr1.setAddressLine2("Apt 4B, Cinnamon Gardens");
            addr1.setCity("Colombo 07");
            addr1.setPostalCode("00700");
            addr1.setProvince("Western Province");
            addr1.setCountry("Sri Lanka");
            addr1.setDefault(true);
            addr1.setNotes("Ring the buzzer for Apt 4B. Parking available near security post.");
            addresses.add(addr1);

            Customer.Address addr2 = new Customer.Address();
            addr2.setId("addr-2");
            addr2.setLabel("Office / Workspace");
            addr2.setType("Office");
            addr2.setRecipientName("Kasun Perera (TechCorp HQ)");
            addr2.setPhone("+94 11 234 5678");
            addr2.setAddressLine1("Level 14, World Trade Center");
            addr2.setAddressLine2("Echelon Square");
            addr2.setCity("Colombo 01");
            addr2.setPostalCode("00100");
            addr2.setProvince("Western Province");
            addr2.setCountry("Sri Lanka");
            addr2.setDefault(false);
            addr2.setNotes("Deliver to 14th floor reception during standard business hours (9 AM - 5 PM).");
            addresses.add(addr2);

            Customer.Address addr3 = new Customer.Address();
            addr3.setId("addr-3");
            addr3.setLabel("Holiday Villa");
            addr3.setType("Other");
            addr3.setRecipientName("Kasun Perera / Villa Caretaker");
            addr3.setPhone("+94 91 223 4455");
            addr3.setAddressLine1("No. 12, Beach Road");
            addr3.setAddressLine2("Thalpe");
            addr3.setCity("Galle");
            addr3.setPostalCode("80000");
            addr3.setProvince("Southern Province");
            addr3.setCountry("Sri Lanka");
            addr3.setDefault(false);
            addr3.setNotes("Contact caretaker Sunil 30 minutes prior to arrival.");
            addresses.add(addr3);

            customer.setSavedAddresses(addresses);

            // Recent Activities
            List<Customer.Activity> activities = new ArrayList<>();

            Customer.Activity act1 = new Customer.Activity();
            act1.setId("act-1");
            act1.setTitle("AC Servicing & Master Filter Clean");
            act1.setProvider("CoolBreeze Air Conditioning Ltd.");
            act1.setDate("Yesterday at 3:30 PM");
            act1.setStatus("In Progress");
            act1.setStatusVariant("warning");
            act1.setAmount("Rs. 4,500");
            act1.setIconType("service");
            activities.add(act1);

            Customer.Activity act2 = new Customer.Activity();
            act2.setId("act-2");
            act2.setTitle("Emergency Plumbing Repair");
            act2.setProvider("QuickFix Plumbers Sri Lanka");
            act2.setDate("Sep 15, 2026");
            act2.setStatus("Completed");
            act2.setStatusVariant("success");
            act2.setAmount("Rs. 6,800");
            act2.setRatingGiven(5.0);
            act2.setIconType("service");
            activities.add(act2);

            Customer.Activity act3 = new Customer.Activity();
            act3.setId("act-3");
            act3.setTitle("Earned 250 ClickCart Loyalty Points");
            act3.setProvider("ClickCart Rewards Club");
            act3.setDate("Sep 15, 2026");
            act3.setStatus("Credited");
            act3.setStatusVariant("info");
            act3.setAmount("+250 pts");
            act3.setIconType("reward");
            activities.add(act3);

            Customer.Activity act4 = new Customer.Activity();
            act4.setId("act-4");
            act4.setTitle("Landscape & Lawn Trimming");
            act4.setProvider("GreenThumb Gardeners");
            act4.setDate("Aug 28, 2026");
            act4.setStatus("Completed");
            act4.setStatusVariant("success");
            act4.setAmount("Rs. 8,000");
            act4.setRatingGiven(4.8);
            act4.setIconType("service");
            activities.add(act4);

            customer.setRecentActivities(activities);

            customerRepository.save(customer);
            log.info("[DEVELOPMENT ONLY] Seeded mock customer successfully: {}", mockId);
        } else {
            log.info("[DEVELOPMENT ONLY] Mock customer already exists in MongoDB: {}", mockId);
        }
    }
}
