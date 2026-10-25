package com.clickcart.model;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
@Document("provider_payout_ledgers")
public class ProviderPayoutLedger {
    @Id public String providerId;
    @Version public Long version;
    public java.util.Map<String, String> reviewNotes = new java.util.HashMap<>();
    public List<Request> requests = new ArrayList<>();
    public BigDecimal reserved() { return requests.stream().filter(r -> !"REJECTED".equals(r.status())).map(Request::amount).reduce(BigDecimal.ZERO, BigDecimal::add); }
    public record Request(String id, BigDecimal amount, String bankName, String accountNumber, String branch, String status, Instant createdAt) {}
}
