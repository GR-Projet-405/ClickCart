package com.clickcart.service;

import com.clickcart.dto.BlockedDateRequest;
import com.clickcart.dto.BlockedDateResponse;
import com.clickcart.exception.AvailabilityConflictException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.BlockedDate;
import com.clickcart.repository.BlockedDateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BlockedDateService {

    private final BlockedDateRepository blockedDateRepository;

    public BlockedDateService(BlockedDateRepository blockedDateRepository) {
        this.blockedDateRepository = blockedDateRepository;
    }

    public BlockedDateResponse createBlockedDate(BlockedDateRequest request) {

        validateDateRange(request.getStartDate(), request.getEndDate());

        validateNoOverlap(
                request.getProviderId(),
                request.getStartDate(),
                request.getEndDate(),
                null
        );

        BlockedDate blockedDate = new BlockedDate(
                request.getProviderId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getReason(),
                request.getNote()
        );

        LocalDateTime now = LocalDateTime.now();
        blockedDate.setCreatedAt(now);
        blockedDate.setUpdatedAt(now);

        return new BlockedDateResponse(
                blockedDateRepository.save(blockedDate)
        );
    }

    public List<BlockedDateResponse> getBlockedDatesByProvider(String providerId) {

        return blockedDateRepository.findByProviderId(providerId)
                .stream()
                .map(BlockedDateResponse::new)
                .toList();
    }

    public BlockedDateResponse updateBlockedDate(
            String id,
            BlockedDateRequest request
    ) {

        BlockedDate existing = blockedDateRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Blocked date not found: " + id
                        )
                );

        validateDateRange(request.getStartDate(), request.getEndDate());

        validateNoOverlap(
                existing.getProviderId(),
                request.getStartDate(),
                request.getEndDate(),
                id
        );

        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setReason(request.getReason());
        existing.setNote(request.getNote());
        existing.setUpdatedAt(LocalDateTime.now());

        return new BlockedDateResponse(
                blockedDateRepository.save(existing)
        );
    }

    public void deleteBlockedDate(String id) {

        if (!blockedDateRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Blocked date not found: " + id
            );
        }

        blockedDateRepository.deleteById(id);
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

    private void validateNoOverlap(
            String providerId,
            LocalDate startDate,
            LocalDate endDate,
            String excludedId
    ) {

        List<BlockedDate> existingDates =
                blockedDateRepository
                        .findByProviderIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                providerId,
                                endDate,
                                startDate
                        );

        boolean hasConflict = existingDates.stream()
                .anyMatch(existing ->
                        excludedId == null ||
                        !existing.getId().equals(excludedId)
                );

        if (hasConflict) {
            throw new AvailabilityConflictException(
                    "Blocked date overlaps with an existing blocked period"
            );
        }
    }
}