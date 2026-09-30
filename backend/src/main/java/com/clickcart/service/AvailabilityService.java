package com.clickcart.service;

import com.clickcart.dto.AvailabilityRuleRequest;
import com.clickcart.dto.AvailabilityRuleResponse;
import com.clickcart.model.AvailabilityRule;
import com.clickcart.repository.AvailabilityRuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.clickcart.exception.AvailabilityConflictException;
import com.clickcart.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(AvailabilityService.class);

    private final AvailabilityRuleRepository availabilityRuleRepository;

    public AvailabilityService(AvailabilityRuleRepository availabilityRuleRepository) {
        this.availabilityRuleRepository = availabilityRuleRepository;
    }

    public AvailabilityRuleResponse createRule(AvailabilityRuleRequest request) {

        log.info("DEV-10: createRule started for provider={} day={} {}-{}",
                request.getProviderId(), request.getDayOfWeek(),
                request.getStartTime(), request.getEndTime());

        validateTimeRange(request.getStartTime(), request.getEndTime());

        log.debug("DEV-10: checking existing rules");
        List<AvailabilityRule> existingRules =
                availabilityRuleRepository.findByProviderIdAndDayOfWeek(
                        request.getProviderId(),
                        request.getDayOfWeek()
                );
        log.debug("DEV-10: existing rules loaded, count={}", existingRules.size());

        validateNoOverlap(
                existingRules,
                request.getStartTime(),
                request.getEndTime()
        );

        LocalDateTime now = LocalDateTime.now();

        AvailabilityRule rule = new AvailabilityRule(
                request.getProviderId(),
                request.getDayOfWeek(),
                request.getStartTime(),
                request.getEndTime(),
                request.isActive()
        );
        rule.setCreatedAt(now);
        rule.setUpdatedAt(now);

        log.debug("DEV-10: saving rule");
        AvailabilityRule saved = availabilityRuleRepository.save(rule);
        log.info("DEV-10: rule saved, id={}", saved.getId());

        return new AvailabilityRuleResponse(saved);
    }

    public List<AvailabilityRuleResponse> getRulesByProvider(String providerId) {

        log.info("DEV-10: getRulesByProvider started for provider={}", providerId);

        List<AvailabilityRuleResponse> results = availabilityRuleRepository
                .findByProviderId(providerId)
                .stream()
                .map(AvailabilityRuleResponse::new)
                .toList();

        log.info("DEV-10: query completed, count={}", results.size());
        return results;
    }

    public List<AvailabilityRuleResponse> getActiveRulesByProvider(String providerId) {

        log.info("DEV-10: getActiveRulesByProvider started for provider={}", providerId);

        List<AvailabilityRuleResponse> results = availabilityRuleRepository
                .findByProviderIdAndActiveTrue(providerId)
                .stream()
                .map(AvailabilityRuleResponse::new)
                .toList();

        log.info("DEV-10: query completed, count={}", results.size());
        return results;
    }

    public AvailabilityRuleResponse updateRule(
            String id,
            AvailabilityRuleRequest request
    ) {

        log.info("DEV-10: updateRule started for id={}", id);

        AvailabilityRule existingRule =
                availabilityRuleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Availability rule not found")
                        );

        validateTimeRange(request.getStartTime(), request.getEndTime());

        List<AvailabilityRule> existingRules =
                availabilityRuleRepository.findByProviderIdAndDayOfWeek(
                        request.getProviderId(),
                        request.getDayOfWeek()
                );

        existingRules.removeIf(rule -> rule.getId().equals(id));

        validateNoOverlap(
                existingRules,
                request.getStartTime(),
                request.getEndTime()
        );

        existingRule.setProviderId(request.getProviderId());
        existingRule.setDayOfWeek(request.getDayOfWeek());
        existingRule.setStartTime(request.getStartTime());
        existingRule.setEndTime(request.getEndTime());
        existingRule.setActive(request.isActive());
        existingRule.setUpdatedAt(LocalDateTime.now());

        AvailabilityRule saved = availabilityRuleRepository.save(existingRule);
        log.info("DEV-10: rule updated, id={}", saved.getId());

        return new AvailabilityRuleResponse(saved);
    }

    public void deleteRule(String id) {

        log.info("DEV-10: deleteRule started for id={}", id);

        if (!availabilityRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Availability rule not found");
        }

        availabilityRuleRepository.deleteById(id);
        log.info("DEV-10: rule deleted, id={}", id);
    }

    private void validateTimeRange(
            LocalTime startTime,
            LocalTime endTime
    ) {

        if (startTime == null || endTime == null) {
            throw new AvailabilityConflictException(
                    "Start time and end time are required"
            );
        }

        if (!startTime.isBefore(endTime)) {
            throw new AvailabilityConflictException(
                    "Start time must be before end time"
            );
        }
    }

    private void validateNoOverlap(
            List<AvailabilityRule> existingRules,
            LocalTime newStart,
            LocalTime newEnd
    ) {

        for (AvailabilityRule existingRule : existingRules) {

            if (!existingRule.isActive()) {
                continue;
            }

            boolean overlaps =
                    newStart.isBefore(existingRule.getEndTime())
                            && newEnd.isAfter(existingRule.getStartTime());

            if (overlaps) {
                throw new AvailabilityConflictException(
                        "Availability rule overlaps with an existing rule"
                );
            }
        }
    }
}