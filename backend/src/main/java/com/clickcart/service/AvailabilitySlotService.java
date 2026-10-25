package com.clickcart.service;

import com.clickcart.dto.AvailabilitySlotResponse;
import com.clickcart.model.AvailabilityRule;
import com.clickcart.model.BlockedDate;
import com.clickcart.repository.AvailabilityRuleRepository;
import com.clickcart.repository.BlockedDateRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilitySlotService {

    private final AvailabilityRuleRepository availabilityRuleRepository;
    private final BlockedDateRepository blockedDateRepository;

    public AvailabilitySlotService(
            AvailabilityRuleRepository availabilityRuleRepository,
            BlockedDateRepository blockedDateRepository
    ) {
        this.availabilityRuleRepository = availabilityRuleRepository;
        this.blockedDateRepository = blockedDateRepository;
    }

    public List<AvailabilitySlotResponse> getAvailability(
            String providerId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(startDate, endDate);

        List<AvailabilitySlotResponse> slots = new ArrayList<>();

        List<AvailabilityRule> rules =
                availabilityRuleRepository.findByProviderIdAndActiveTrue(providerId);

        List<BlockedDate> blockedDates =
                blockedDateRepository.findByProviderId(providerId);

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {

            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();

            boolean blocked = isBlocked(currentDate, blockedDates);

            if (!blocked) {

                for (AvailabilityRule rule : rules) {

                    if (rule.getDayOfWeek() == dayOfWeek) {

                        slots.add(
                                new AvailabilitySlotResponse(
                                        currentDate,
                                        rule.getStartTime(),
                                        rule.getEndTime(),
                                        true
                                )
                        );
                    }
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        return slots;
    }

    private boolean isBlocked(
            LocalDate date,
            List<BlockedDate> blockedDates
    ) {

        return blockedDates.stream()
                .anyMatch(blockedDate ->
                        !date.isBefore(blockedDate.getStartDate())
                                && !date.isAfter(blockedDate.getEndDate())
                );
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }
    }
}