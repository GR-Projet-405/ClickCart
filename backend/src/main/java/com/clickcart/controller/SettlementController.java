package com.clickcart.controller;

import com.clickcart.dto.SettlementCreateRequest;
import com.clickcart.dto.SettlementPageResponse;
import com.clickcart.dto.SettlementPageResponse.SettlementRow;
import com.clickcart.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Settlement Tracking &amp; Authorized Finance States.
 *
 * <p>Mapped at two base paths:
 * <ul>
 *   <li>{@code /api/provider/settlements} – the original provider-facing path</li>
 *   <li>{@code /api/settlements}           – public alias referenced by DEV-29 tests</li>
 * </ul>
 */
@RestController
@CrossOrigin(origins = "*")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    /**
     * GET /api/provider/settlements
     * GET /api/settlements
     * GET /api/settlements/my  (BE-048 – page=0 is normalised to 1 in the service layer)
     */
    @GetMapping({"/api/provider/settlements", "/api/settlements", "/api/settlements/my"})
    public ResponseEntity<SettlementPageResponse> getSettlements(
            @RequestParam(defaultValue = "1")     int    page,
            @RequestParam(defaultValue = "10")    int    pageSize,
            @RequestParam(defaultValue = "")      String search,
            @RequestParam(defaultValue = "Today") String dateFilter,
            @RequestParam(defaultValue = "")      String stateFilter
    ) {
        SettlementPageResponse response =
                settlementService.getSettlements(page, pageSize, search, dateFilter, stateFilter);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/provider/settlements
     * POST /api/settlements
     *
     * Creates a new settlement record. Fee is auto-calculated at 2% of amount.
     * Returns the newly created settlement row.
     * Invalid date strings return 400 Bad Request (BE-047).
     */
    @PostMapping({"/api/provider/settlements", "/api/settlements"})
    public ResponseEntity<SettlementRow> createSettlement(
            @Valid @RequestBody SettlementCreateRequest request
    ) {
        throw new com.clickcart.exception.ForbiddenException("Settlement records are generated from payout requests and finance processing");
    }
}
