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
 * REST controller for Settlement Tracking & Authorized Finance States.
 */
@RestController
@RequestMapping("/api/provider/settlements")
@CrossOrigin(origins = "*")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    /**
     * GET /api/provider/settlements
     */
    @GetMapping
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
     *
     * Creates a new settlement record. Fee is auto-calculated at 2% of amount.
     * Returns the newly created settlement row.
     */
    @PostMapping
    public ResponseEntity<SettlementRow> createSettlement(
            @Valid @RequestBody SettlementCreateRequest request
    ) {
        SettlementRow created = settlementService.createSettlement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
