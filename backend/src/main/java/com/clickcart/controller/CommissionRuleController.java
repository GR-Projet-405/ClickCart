package com.clickcart.controller;

import com.clickcart.model.CommissionRule;
import com.clickcart.model.CommissionRule.ProviderTier;
import com.clickcart.model.CommissionRule.RuleStatus;
import com.clickcart.service.CommissionCalculatorService;
import com.clickcart.service.CommissionCalculatorService.Calculation;
import com.clickcart.service.CommissionRuleService;
import com.clickcart.service.CommissionRuleService.ConflictException;
import com.clickcart.service.CommissionRuleService.NotFoundException;
import com.clickcart.service.CommissionRuleService.RuleRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/commission")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class CommissionRuleController {
    private final CommissionRuleService rules;
    private final CommissionCalculatorService calculator;

    public CommissionRuleController(CommissionRuleService rules, CommissionCalculatorService calculator) { this.rules = rules; this.calculator = calculator; }
    @GetMapping("/rules") public Object listRules() { return rules.list(); }
    @PostMapping("/rules") @ResponseStatus(HttpStatus.CREATED) public CommissionRule create(@Valid @RequestBody RuleRequest request) { return rules.create(request, "jwt:sub"); }
    @PutMapping("/rules/{id}") public CommissionRule update(@PathVariable String id, @RequestHeader("If-Match") long version, @Valid @RequestBody RuleRequest request) { return rules.update(id, version, request); }
    @PatchMapping("/rules/{id}/status") public CommissionRule status(@PathVariable String id, @RequestHeader("If-Match") long version, @RequestParam RuleStatus value) { return rules.updateStatus(id, version, value); }
    @PostMapping("/calculate") public Calculation calculate(@Valid @RequestBody CalculationRequest request) { return calculator.calculate(request.bookingAmount(), rules.match(request.category(), request.providerTier(), Instant.now())); }
    @PostMapping("/simulator") public Calculation simulator(@Valid @RequestBody CalculationRequest request) { return calculate(request); }

    public record CalculationRequest(@NotNull @DecimalMin("0.00") BigDecimal bookingAmount, @NotBlank String category, @NotNull ProviderTier providerTier) {}
    @ExceptionHandler(NotFoundException.class) @ResponseStatus(HttpStatus.NOT_FOUND) public ErrorResponse notFound(NotFoundException ex) { return new ErrorResponse(404, ex.getMessage()); }
    @ExceptionHandler({IllegalArgumentException.class, jakarta.validation.ConstraintViolationException.class}) @ResponseStatus(HttpStatus.BAD_REQUEST) public ErrorResponse invalid(Exception ex) { return new ErrorResponse(400, ex.getMessage()); }
    @ExceptionHandler(ConflictException.class) @ResponseStatus(HttpStatus.CONFLICT) public ErrorResponse conflict(ConflictException ex) { return new ErrorResponse(409, ex.getMessage()); }
    public record ErrorResponse(int status, String message, Instant timestamp) { public ErrorResponse(int status, String message) { this(status, message, Instant.now()); } }
}
