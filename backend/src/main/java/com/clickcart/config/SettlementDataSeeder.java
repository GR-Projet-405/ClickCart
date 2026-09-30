package com.clickcart.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.clickcart.model.Settlement;
import com.clickcart.repository.SettlementRepository;

/**
 * Seeds 142 settlement records with Sri Lankan merchant names, LKR amounts,
 * and Sri Lankan bank / payment method names into MongoDB.
 * Drops and re-seeds on every restart so any data changes take effect immediately.
 */
@Component
@Order(20)
public class SettlementDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SettlementDataSeeder.class);
    private static final String DEFAULT_PROVIDER_ID = "PROV-1002";

    private final SettlementRepository settlementRepository;

    public SettlementDataSeeder(SettlementRepository settlementRepository) {
        this.settlementRepository = settlementRepository;
    }

    @Override
    public void run(String... args) {
        // Always wipe & reseed so data changes take effect without manual DB ops
        long existing = settlementRepository.countByProviderId(DEFAULT_PROVIDER_ID);
        if (existing > 0) {
            log.info("[SettlementDataSeeder] Clearing {} existing records before LK reseed...", existing);
            List<Settlement> old = settlementRepository.findByProviderIdAndFinanceStateIn(
                DEFAULT_PROVIDER_ID,
                List.of("Authorized","Captured","Settled","Released","On Hold","Disputed"));
            settlementRepository.deleteAll(old);
        }

        log.info("[SettlementDataSeeder] Seeding 142 Sri Lanka settlements for provider {}...", DEFAULT_PROVIDER_ID);

        List<Settlement> settlements = new ArrayList<>();

        // ── Fixed reference records – Sri Lankan merchants & banks ────────────
        //   amounts in LKR (typical service platform payouts: 50,000 – 5,000,000 LKR)
        String[][] fixed = {
            {"#SET-4491","Lanka Pro Cleaners Pvt Ltd",       "425000.00","8500.00",  "416500.00","2025-10-24","2025-10-25","Bank of Ceylon",          "Released"},
            {"#SET-4492","Colombo Home Services Ltd",        "267000.00","5340.00",  "261660.00","2025-10-24","2025-10-25","People's Bank",           "Settled"},
            {"#SET-4493","Helix IT Solutions (Pvt) Ltd",     "1062600.00","21252.00","1041348.00","2025-10-23","2025-10-24","Commercial Bank of Ceylon","Authorized"},
            {"#SET-4494","CloudSmart Lanka (Pvt) Ltd",       "94500.00","1890.00",   "92610.00","2025-10-22","2025-10-23","People's Bank",            "Disputed"},
            {"#SET-4495","Velo Delivery Services",           "56700.00","1134.00",   "55566.00","2025-10-21","2025-10-22","Hatton National Bank",     "On Hold"},
            {"#SET-4496","Krypton Technologies Lanka",       "3735000.00","74700.00","3660300.00","2025-10-20","2025-10-21","Sampath Bank",            "Captured"},
            {"#SET-4497","Nova Logistics Lanka Ltd",         "294000.00","5880.00",  "288120.00","2025-10-19","2025-10-20","Nations Trust Bank",       "Released"},
            {"#SET-4498","Solaris Energy Solutions",         "202500.00","4050.00",  "198450.00","2025-10-19","2025-10-20","Bank of Ceylon",           "Settled"},
            {"#SET-4499","Orbit Media Lanka (Pvt) Ltd",     "663000.00","13260.00", "649740.00","2025-10-18","2025-10-19","Commercial Bank of Ceylon","Released"},
            {"#SET-4500","TechPoint Solutions Colombo",      "135000.00","2700.00",  "132300.00","2025-10-18","2025-10-19","Sampath Bank",             "Authorized"},
            {"#SET-4501","Bluewave Retail (Pvt) Ltd",       "540000.00","10800.00", "529200.00","2025-10-17","2025-10-18","Hatton National Bank",     "Settled"},
            {"#SET-4502","Pinnacle Software Solutions",      "216000.00","4320.00",  "211680.00","2025-10-17","2025-10-18","People's Bank",            "Released"},
            {"#SET-4503","Vertex Global Lanka Ltd",          "930000.00","18600.00", "911400.00","2025-10-16","2025-10-17","Commercial Bank of Ceylon","Captured"},
            {"#SET-4504","RedWave Technologies Lanka",       "75000.00","1500.00",   "73500.00","2025-10-16","2025-10-17","Bank of Ceylon",            "On Hold"},
            {"#SET-4505","Lumina Home Care Services",        "273000.00","5460.00",  "267540.00","2025-10-15","2025-10-16","Nations Trust Bank",        "Settled"},
            {"#SET-4506","QuantumTech Colombo",              "1320000.00","26400.00","1293600.00","2025-10-15","2025-10-16","Sampath Bank",             "Released"},
            {"#SET-4507","Polaris Retail Lanka",             "99000.00","1980.00",   "97020.00","2025-10-14","2025-10-15","Hatton National Bank",      "Authorized"},
            {"#SET-4508","Nexus Ventures Pvt Ltd",           "495000.00","9900.00",  "485100.00","2025-10-14","2025-10-15","People's Bank",            "Settled"},
            {"#SET-4509","Cobalt Systems Lanka",             "810000.00","16200.00", "793800.00","2025-10-13","2025-10-14","Commercial Bank of Ceylon","Released"},
            {"#SET-4510","SkyNet Group Lanka Pvt Ltd",       "168000.00","3360.00",  "164640.00","2025-10-13","2025-10-14","Bank of Ceylon",           "Disputed"},
            {"#SET-4511","Aurora Analytics Lanka",           "252000.00","5040.00",  "246960.00","2025-10-12","2025-10-13","Sampath Bank",             "Settled"},
            {"#SET-4512","Ironclad Construction Lanka",      "594000.00","11880.00", "582120.00","2025-10-12","2025-10-13","Nations Trust Bank",        "Released"},
            {"#SET-4513","Sterling Finance Lanka",           "336000.00","6720.00",  "329280.00","2025-10-11","2025-10-12","Hatton National Bank",     "Captured"},
            {"#SET-4514","Eclipse Retail Kandy",             "189000.00","3780.00",  "185220.00","2025-10-11","2025-10-12","People's Bank",            "On Hold"},
            {"#SET-4515","Cosmos Traders (Pvt) Ltd",         "684000.00","13680.00", "670320.00","2025-10-10","2025-10-11","Commercial Bank of Ceylon","Settled"},
            {"#SET-4516","Titan Digital Lanka",              "297000.00","5940.00",  "291060.00","2025-10-10","2025-10-11","Bank of Ceylon",           "Released"},
            {"#SET-4517","Atlas Corporation Lanka",          "1035000.00","20700.00","1014300.00","2025-10-09","2025-10-10","Sampath Bank",            "Authorized"},
            {"#SET-4518","Mercury Media Colombo",            "123000.00","2460.00",  "120540.00","2025-10-09","2025-10-10","Nations Trust Bank",        "Settled"},
            {"#SET-4519","Jupiter Tech Solutions Lanka",     "471000.00","9420.00",  "461580.00","2025-10-08","2025-10-09","Hatton National Bank",     "Released"},
            {"#SET-4520","Saturn Global Lanka Pvt Ltd",      "246000.00","4920.00",  "241080.00","2025-10-08","2025-10-09","People's Bank",            "Settled"},
        };

        for (String[] row : fixed) {
            settlements.add(build(row[0], row[1],
                    new BigDecimal(row[2]), new BigDecimal(row[3]), new BigDecimal(row[4]),
                    LocalDate.parse(row[5]), LocalDate.parse(row[6]), row[7], row[8]));
        }

        // ── Generated records to reach 142 ────────────────────────────────────
        String[] merchants = {
            // Colombo region businesses
            "Perera & Sons Trading Co.",
            "Silva Home Solutions Pvt Ltd",
            "Fernando Electrical Services",
            "Jayasinghe Plumbing Works",
            "Wickramasinghe Constructions",
            "Ranasinghe AC & Refrigeration",
            "Bandara Cleaning Services",
            "Gunawardena Garden Care",
            "Kumarasinghe Pest Control",
            "Seneviratne IT Services",
            // Gampaha / Kandy / Galle
            "Gampaha Home Maintenance Ltd",
            "Kandy Pro Services Pvt Ltd",
            "Galle Home Care Services",
            "Negombo Plumbing & Electrical",
            "Matara Cleaning Solutions",
            // National companies
            "Dialog Axiata Home Services",
            "SLT Mobitel Field Services",
            "CEB Authorized Services Lanka",
            "National Water Board Services",
            "Sri Lanka Telecom Solutions",
            // Service sector
            "Colombo Property Care Pvt Ltd",
            "Lanka Pest Management Services",
            "Island Wide Logistics (Pvt) Ltd",
            "Green Lanka Garden Services",
            "Smart Home Lanka Pvt Ltd",
        };

        // Sri Lankan banks and payment rails
        String[] methods = {
            "Bank of Ceylon",
            "People's Bank",
            "Commercial Bank of Ceylon",
            "Hatton National Bank",
            "Sampath Bank",
            "Nations Trust Bank",
            "DFCC Bank",
            "Seylan Bank",
        };

        String[] states  = {"Settled","Released","Authorized","Captured","On Hold","Disputed"};
        int[]    weights = {30,       30,         12,          12,         10,        6};

        Random rnd    = new Random(12345L);
        int idSeq     = 4521;
        int dayOffset = 0;

        while (settlements.size() < 142) {
            // Typical LKR service platform payout: 50,000 – 2,000,000
            double rawAmount = 50_000 + rnd.nextDouble() * 1_950_000;
            BigDecimal amount = BigDecimal.valueOf(rawAmount).setScale(2, RoundingMode.HALF_UP);
            BigDecimal fee    = amount.multiply(new BigDecimal("0.02")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal net    = amount.subtract(fee);

            LocalDate captureDate = LocalDate.of(2025, 10, 7).minusDays(dayOffset % 60);
            LocalDate settlDate   = captureDate.plusDays(1);
            dayOffset++;

            String state    = weightedPick(states, weights, rnd);
            String method   = methods[rnd.nextInt(methods.length)];
            String merchant = merchants[rnd.nextInt(merchants.length)];

            settlements.add(build("#SET-" + idSeq++, merchant, amount, fee, net,
                    captureDate, settlDate, method, state));
        }

        settlementRepository.saveAll(settlements);
        log.info("[SettlementDataSeeder] Seeded {} Sri Lankan LKR settlements into MongoDB.", settlements.size());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Settlement build(String id, String merchant,
                             BigDecimal amount, BigDecimal fee, BigDecimal net,
                             LocalDate capture, LocalDate settle,
                             String method, String state) {
        Settlement s = new Settlement();
        s.setId(id);
        s.setProviderId(DEFAULT_PROVIDER_ID);
        s.setMerchantRecipient(merchant);
        s.setAmount(amount);
        s.setFee(fee);
        s.setNetAmount(net);
        s.setCaptureDate(capture);
        s.setSettlementDate(settle);
        s.setPayoutMethod(method);
        s.setFinanceState(state);
        return s;
    }

    private static String weightedPick(String[] items, int[] weights, Random rnd) {
        int total = 0;
        for (int w : weights) total += w;
        int pick = rnd.nextInt(total);
        for (int i = 0; i < items.length; i++) {
            pick -= weights[i];
            if (pick < 0) return items[i];
        }
        return items[items.length - 1];
    }
}
