package com.clickcart.service;

import com.clickcart.controller.ProviderSubmissionController;
import com.clickcart.dto.*;
import com.clickcart.model.*;
import com.clickcart.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.data.mongodb.uri=${CLICKCART_TEST_MONGODB_URI}",
    "spring.data.mongodb.database=clickcart-provider-integration-tests",
    "clickcart.security.enabled=false", "clickcart.demo-data.enabled=false"
})
@EnabledIfEnvironmentVariable(named="CLICKCART_TEST_MONGODB_URI", matches=".+")
class ProviderDatabaseFlowTest {
    @Autowired com.clickcart.controller.AdminPayoutController payoutReview;
    @Autowired ProviderEarningService earnings;
    @Autowired CommissionTransactionService transactions;
    @Autowired CommissionRuleService rules;
    @Autowired UserRepository users;
    @Autowired ProviderSubmissionController submissions;
    @Autowired ProviderVerificationService verification;
    @Autowired VerificationDocumentStorage documents;
    @AfterEach void clearIdentity() { SecurityContextHolder.clearContext(); }
    private String identity() {
        String id = UUID.randomUUID().toString();
        var user = new User(); user.setId(id); user.setFullName("Integration Provider"); user.setEmail(id + "@example.test"); user.setRole(Role.SERVICE_PROVIDER); users.save(user);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(id, null, List.of(new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER"))));
        return id;
    }
    @Test void commissionBalancesAndPayoutReservationPersistWithoutCrossAccountLeakage() {
        String owner = identity(), category = "Test-" + UUID.randomUUID();
        rules.create(new CommissionRuleService.RuleRequest("Integration rate", "Test", category, CommissionRule.CommissionType.PERCENTAGE, new BigDecimal("10"), BigDecimal.ZERO, null, BigDecimal.ZERO, CommissionRule.ProviderTier.ALL, 50, Instant.now().minusSeconds(5), null), "test-admin");
        var request = new CommissionTransactionService.TransactionRequest(UUID.randomUUID().toString(), "Customer", owner, "Cleaning", new BigDecimal("10000"), category, CommissionRule.ProviderTier.ALL);
        var transaction = transactions.create(request);
        transactions.create(request); // retries must not credit twice
        assertThat(earnings.getEarningsSummary(owner, "all").getPendingClearance()).isEqualByComparingTo("9000");
        transactions.setPaid(transaction.transactionId(), true, transaction.transactionId());
        assertThat(earnings.getEarningsSummary(owner, "all").getNetAvailableBalance()).isEqualByComparingTo("9000");
        var payout = new PayoutRequest(); payout.setAmount(new BigDecimal("8000")); payout.setBankName("Test Bank"); payout.setAccountNumber("12345678");
        var savedPayout = earnings.requestPayout(owner, payout);
        assertThat(savedPayout.getStatus()).isEqualTo("REQUESTED");
        assertThat(earnings.getEarningsSummary(owner, "all").getNetAvailableBalance()).isEqualByComparingTo("1000");
        assertThatThrownBy(() -> earnings.requestPayout(owner, payout)).isInstanceOf(com.clickcart.exception.BadRequestException.class);
        assertThatThrownBy(() -> transactions.setPaid(transaction.transactionId(), false, transaction.transactionId())).isInstanceOf(CommissionRuleService.ConflictException.class);
        assertThat(earnings.getEarningsSummary("other-" + owner, "all").getNetAvailableBalance()).isZero();
        assertThat(earnings.getCategoryBreakdown("other-" + owner)).isEmpty();
        assertThat(earnings.getTransactionById(owner, transaction.transactionId())).isNotNull();
        payoutReview.review(owner, savedPayout.getPayoutId(), new com.clickcart.controller.AdminPayoutController.Review("REJECTED", "Incorrect account details"));
        assertThat(earnings.getEarningsSummary(owner, "all").getNetAvailableBalance()).isEqualByComparingTo("9000");
        var approvedPayout = earnings.requestPayout(owner, payout);
        payoutReview.review(owner, approvedPayout.getPayoutId(), new com.clickcart.controller.AdminPayoutController.Review("SETTLED", "BANK-TEST-REFERENCE"));
        assertThat(earnings.getEarningsSummary(owner, "all").getNetAvailableBalance()).isEqualByComparingTo("1000");
    }
    @Test void businessVerificationRequiresDocumentsAndSupportsReviewAndPrivateDownloads() throws Exception {
        String owner = identity();
        var details = new ProviderVerificationRequest("BUSINESS", "Owner", "199012345678", "Address", "0771234567", "Business", "BR123", "Business address", "0111234567");
        submissions.saveStepOne(details);
        assertThatThrownBy(() -> verification.updateProviderStatus(owner, "APPROVED")).isInstanceOf(IllegalArgumentException.class);
        byte[] data = new byte[]{(byte)137,80,78,71};
        var front = new MockMultipartFile("nicFront", "nic.png", "image/png", data);
        var back = new MockMultipartFile("nicBack", "nic.png", "image/png", data);
        assertThatThrownBy(() -> submissions.saveStepTwo(front, back, null)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        var certificate = new MockMultipartFile("businessCert", "registration.png", "image/png", data);
        submissions.saveStepTwo(front, back, certificate);
        var record = verification.getByUserId(owner).orElseThrow();
        assertThat(record.getStatus()).isEqualTo("PENDING");
        assertThat(record.getDocuments()).hasSize(3);
        String documentId = record.getDocuments().get(0).getUrl().replace("/api/provider-verification/documents/", "");
        var other = new UsernamePasswordAuthenticationToken("other", null, List.of(new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER")));
        assertThatThrownBy(() -> documents.read(documentId, other)).isInstanceOf(com.clickcart.exception.ForbiddenException.class);
        try (var stream = documents.read(documentId, SecurityContextHolder.getContext().getAuthentication()).getInputStream()) { assertThat(stream.readAllBytes()).isEqualTo(data); }
        var rejection = new RejectionRequestDto(); rejection.setReasons(List.of("Unreadable certificate")); rejection.setSendEmail(false);
        verification.rejectProvider(owner, rejection);
        assertThat(verification.getByUserId(owner).orElseThrow().getRejectionReasons()).contains("Unreadable certificate");
        submissions.saveStepOne(details); submissions.saveStepTwo(front, back, certificate);
        verification.updateProviderStatus(owner, "APPROVED");
        assertThat(verification.getByUserId(owner).orElseThrow().getStatus()).isEqualTo("APPROVED");
    }
}
