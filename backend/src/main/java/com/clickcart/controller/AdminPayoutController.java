package com.clickcart.controller;
import com.clickcart.model.ProviderPayoutLedger;
import com.clickcart.repository.ProviderPayoutLedgerRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;
@RestController
@RequestMapping("/api/admin/payouts")
public class AdminPayoutController {
    private final ProviderPayoutLedgerRepository ledgers;
    public AdminPayoutController(ProviderPayoutLedgerRepository ledgers) { this.ledgers = ledgers; }
    public record Entry(String providerId, ProviderPayoutLedger.Request request) {}
    @GetMapping public Object list() { return ledgers.findAll().stream().flatMap(l -> l.requests.stream().map(r -> new Entry(l.providerId, r))).toList(); }
    public record Review(String status, String reference) {}
    @PatchMapping("/{providerId}/{requestId}") public Object review(@PathVariable String providerId, @PathVariable String requestId, @RequestBody Review review) {
        if (!Set.of("SETTLED", "REJECTED").contains(review.status() == null ? "" : review.status()) || review.reference() == null || review.reference().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a transfer reference or rejection reason");
        var ledger = ledgers.findById(providerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        int index = -1; for (int i=0; i<ledger.requests.size(); i++) if (requestId.equals(ledger.requests.get(i).id())) index=i;
        if (index < 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var current = ledger.requests.get(index);
        if (!"REQUESTED".equals(current.status())) throw new ResponseStatusException(HttpStatus.CONFLICT, "This payout has already been reviewed");
        var updated = new ProviderPayoutLedger.Request(current.id(), current.amount(), current.bankName(), current.accountNumber(), current.branch(), review.status(), current.createdAt());
        ledger.requests.set(index, updated);
        ledger.reviewNotes.put(requestId, review.reference().trim());
        try { ledgers.save(ledger); } catch (org.springframework.dao.OptimisticLockingFailureException e) { throw new ResponseStatusException(HttpStatus.CONFLICT, "This request changed. Refresh and try again."); }
        return new Entry(providerId, updated);
    }
}
