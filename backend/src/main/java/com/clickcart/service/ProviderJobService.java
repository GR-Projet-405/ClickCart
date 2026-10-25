package com.clickcart.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.clickcart.dto.CompleteJobRequest;
import com.clickcart.dto.CreateCustomJobRequest;
import com.clickcart.dto.ProviderJobDetailDto;
import com.clickcart.dto.ProviderJobSummaryDto;
import com.clickcart.exception.ApiException;
import com.clickcart.model.JobPhoto;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.repository.ProviderJobRepository;

@Service
public class ProviderJobService {

    private final ProviderJobRepository repository;
    @org.springframework.beans.factory.annotation.Autowired private BookingWorkflowService workflow;
    private final JobProofStorageService storageService;
    @org.springframework.beans.factory.annotation.Autowired private CommissionTransactionService commissions;
    @org.springframework.beans.factory.annotation.Autowired private CommissionRuleService commissionRules;
    @org.springframework.beans.factory.annotation.Autowired private CommissionCalculatorService calculator;

    public ProviderJobService(ProviderJobRepository repository, JobProofStorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    public List<ProviderJobSummaryDto> listJobs(String providerId, JobStatus status) {
        List<ProviderJob> jobs = status == null
            ? repository.findByProviderIdOrderByScheduledStartAsc(providerId)
            : repository.findByProviderIdAndStatusOrderByScheduledStartAsc(providerId, status);
        return jobs.stream().map(this::toSummary).toList();
    }

    public List<ProviderJobSummaryDto> listJobsByMonth(String providerId, JobStatus status, int year, int month) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.plusMonths(1);

        Instant startInstant = monthStart.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = monthEnd.atStartOfDay(ZoneOffset.UTC).toInstant();

        List<ProviderJob> jobs;
        if (status == null) {
            jobs = repository.findByProviderIdAndScheduledStartBetweenOrderByScheduledStartAsc(
                providerId, startInstant, endInstant
            );
        } else {
            jobs = repository.findByProviderIdAndStatusAndScheduledStartBetweenOrderByScheduledStartAsc(
                providerId, status, startInstant, endInstant
            );
        }
        return jobs.stream().map(this::toSummary).toList();
    }

    public ProviderJobDetailDto createCustomJob(String providerId, CreateCustomJobRequest request) {
        Instant now = Instant.now();

        ProviderJob job = new ProviderJob();
        job.setProviderId(providerId);
        job.setStatus(JobStatus.PLACED);
        job.setPublicCode(generatePublicCode());
        job.setBookingCode(generateBookingCode());
        job.setPlacedAt(now);
        job.setCreatedAt(now);
        job.setUpdatedAt(now);

        job.setCustomerId(request.customerId());
        job.setCustomerName(request.customerName());
        job.setCustomerPhone(request.customerPhone());
        job.setCustomerVerified(false);

        job.setServiceTitle(request.serviceTitle());
        job.setServiceCategory(request.serviceCategory());
        job.setPackageName(request.packageName());

        job.setAddress(request.address());
        job.setCity(request.city());
        job.setLatitude(request.latitude());
        job.setLongitude(request.longitude());

        job.setScheduledStart(request.scheduledStart());
        job.setScheduledEnd(request.scheduledEnd());

        job.setServiceBaseFee(request.serviceBaseFee());
        job.setPartsTopUp(request.partsTopUp());

        double gross = (request.serviceBaseFee() == null ? 0 : request.serviceBaseFee()) + (request.partsTopUp() == null ? 0 : request.partsTopUp());
        if (gross <= 0) throw ApiException.badRequest("Enter a positive service amount");
        var rule = commissionRules.match(request.serviceCategory(), com.clickcart.model.CommissionRule.ProviderTier.ALL, now);
        var split = calculator.calculate(java.math.BigDecimal.valueOf(gross), rule);
        job.setPlatformCommission(split.commissionAmount().doubleValue());
        job.setNetPayout(split.providerPayout().doubleValue());

        job.setPaymentHold("ESCROW");
        job.setProgressLabel("Custom job awaiting confirmation");
        job.setProgressPercent(0);

        job.setAccessInstructions(request.accessInstructions());

        if (request.notes() != null && !request.notes().isBlank()) {
            job.setCompletionNotes(request.notes());
        }

        return toDetail(repository.save(job));
    }

    private String generatePublicCode() {
        return "CJ-" + System.currentTimeMillis();
    }

    private String generateBookingCode() {
        return "BK-" + System.currentTimeMillis();
    }

    public ProviderJobDetailDto getJob(String providerId, String jobId) {
        return toDetail(requireOwnedJob(providerId, jobId));
    }

    public ProviderJobDetailDto acceptJob(String providerId, String jobId) {
        ProviderJob job = requireOwnedJob(providerId, jobId);
        requireStatus(job, JobStatus.PLACED, "Only placed jobs can be accepted");
        Instant now = Instant.now();
        job.setStatus(JobStatus.ACCEPTED);
        job.setAcceptedAt(now);
        job.setProgressLabel("Accepted by provider");
        job.setProgressPercent(40);
        job.setUpdatedAt(now);
        return toDetail(repository.save(job));
    }

    public ProviderJobDetailDto startJob(String providerId, String jobId) {
        ProviderJob job = requireOwnedJob(providerId, jobId);
        requireStatus(job, JobStatus.ACCEPTED, "Only accepted jobs can be started");
        workflow.requireActiveBooking(job);
        Instant now = Instant.now();
        job.setStatus(JobStatus.IN_PROGRESS);
        job.setStartedAt(now);
        workflow.updateBooking(job, com.clickcart.model.BookingStatus.IN_PROGRESS, "In progress");
        job.setProgressLabel("On site servicing");
        job.setProgressPercent(70);
        job.setUpdatedAt(now);
        return toDetail(repository.save(job));
    }

    public ProviderJobDetailDto uploadProof(String providerId, String jobId, MultipartFile file) {
        ProviderJob job = requireOwnedJob(providerId, jobId);
        if (job.getStatus() != JobStatus.IN_PROGRESS) {
            throw ApiException.badRequest("Photographic proof can only be added while the job is in progress");
        }
        if (job.getPhotos() != null && job.getPhotos().size() >= 8) {
            throw ApiException.badRequest("A maximum of 8 photos can be attached");
        }
        JobPhoto photo = storageService.store(job.getId(), file);
        job.getPhotos().add(photo);
        job.setUpdatedAt(Instant.now());
        return toDetail(repository.save(job));
    }

    public ProviderJobDetailDto completeJob(String providerId, String jobId, CompleteJobRequest request) {
        ProviderJob job = requireOwnedJob(providerId, jobId);
        requireStatus(job, JobStatus.IN_PROGRESS, "Only in-progress jobs can be marked complete");
        if (job.getPhotos() == null || job.getPhotos().isEmpty()) {
            throw ApiException.badRequest("Upload at least one photographic proof before completing the job");
        }
        Instant now = Instant.now();
        var transaction = commissions.create(new CommissionTransactionService.TransactionRequest("JOB-" + job.getId(), job.getCustomerName(), providerId, job.getServiceTitle(), java.math.BigDecimal.valueOf((job.getServiceBaseFee() == null ? 0 : job.getServiceBaseFee()) + (job.getPartsTopUp() == null ? 0 : job.getPartsTopUp())), job.getServiceCategory(), com.clickcart.model.CommissionRule.ProviderTier.ALL));
        job.setPlatformCommission(transaction.commissionAmount().doubleValue());
        job.setNetPayout(transaction.providerEarning().doubleValue());
        job.setStatus(JobStatus.COMPLETED);
        job.setCompletedAt(now);
        workflow.updateBooking(job, com.clickcart.model.BookingStatus.COMPLETED, "Completed - cash payment due");
        job.setProgressLabel("Completed");
        job.setProgressPercent(100);
        if (request != null && request.completionNotes() != null && !request.completionNotes().isBlank()) {
            job.setCompletionNotes(request.completionNotes().trim());
        }
        job.setUpdatedAt(now);
        return toDetail(repository.save(job));
    }

    public Resource loadProof(String providerId, String jobId, String photoId) {
        ProviderJob job = requireOwnedJob(providerId, jobId);
        JobPhoto photo = job.getPhotos().stream()
            .filter(item -> photoId.equals(item.getId()))
            .findFirst()
            .orElseThrow(() -> ApiException.notFound("Photo not found"));
        Path path = storageService.resolve(job.getId(), photo.getStoredName());
        if (!Files.exists(path)) {
            throw ApiException.notFound("Photo file is no longer available");
        }
        return new FileSystemResource(path);
    }

    public MediaType mediaTypeFor(String providerId, String jobId, String photoId) {
        ProviderJob job = requireOwnedJob(providerId, jobId);
        JobPhoto photo = job.getPhotos().stream()
            .filter(item -> photoId.equals(item.getId()))
            .findFirst()
            .orElseThrow(() -> ApiException.notFound("Photo not found"));
        if (photo.getContentType() == null || photo.getContentType().isBlank()) {
            return MediaType.IMAGE_JPEG;
        }
        return MediaType.parseMediaType(photo.getContentType());
    }

    private ProviderJob requireOwnedJob(String providerId, String jobId) {
        ProviderJob job = repository.findById(jobId)
            .orElseThrow(() -> ApiException.notFound("Job not found"));
        if (!providerId.equals(job.getProviderId())) {
            throw ApiException.forbidden("You are not allowed to access this job");
        }
        return job;
    }

    private static void requireStatus(ProviderJob job, JobStatus expected, String message) {
        if (job.getStatus() != expected) {
            throw ApiException.badRequest(message);
        }
    }

    private ProviderJobSummaryDto toSummary(ProviderJob job) {
        return new ProviderJobSummaryDto(
            job.getId(),
            job.getPublicCode(),
            job.getBookingCode(),
            job.getStatus(),
            job.getServiceTitle(),
            job.getServiceCategory(),
            job.getCustomerName(),
            job.getCustomerPhone(),
            job.getCustomerAvatarUrl(),
            job.getAddress(),
            job.getCity(),
            job.getLatitude(),
            job.getLongitude(),
            job.getDistanceKm(),
            job.getEtaMinutes(),
            job.getTransitNote(),
            job.getScheduledStart(),
            job.getScheduledEnd(),
            job.getStartedAt(),
            job.getCompletedAt(),
            job.getPaymentHold(),
            job.getNetPayout(),
            job.getProgressLabel(),
            job.getProgressPercent()
        );
    }

    private ProviderJobDetailDto toDetail(ProviderJob job) {
        List<ProviderJobDetailDto.DiagnosticDto> diagnostics = job.getDiagnostics() == null
            ? List.of()
            : job.getDiagnostics().stream()
                .map(item -> new ProviderJobDetailDto.DiagnosticDto(item.getTitle(), item.getDetail()))
                .toList();
        List<ProviderJobDetailDto.PhotoDto> photos = job.getPhotos() == null
            ? List.of()
            : job.getPhotos().stream()
                .map(item -> new ProviderJobDetailDto.PhotoDto(
                    item.getId(),
                    item.getOriginalName(),
                    item.getContentType(),
                    item.getSizeBytes(),
                    item.getUploadedAt()
                ))
                .toList();
        return new ProviderJobDetailDto(
            job.getId(),
            job.getPublicCode(),
            job.getBookingCode(),
            job.getStatus(),
            job.getServiceTitle(),
            job.getServiceCategory(),
            job.getPackageName(),
            job.getSlaLabel(),
            job.getCustomerId(),
            job.getCustomerName(),
            job.getCustomerPhone(),
            job.getCustomerAvatarUrl(),
            job.getCustomerRating(),
            job.getCustomerPreviousBookings(),
            job.isCustomerVerified(),
            job.getCustomerMemberArea(),
            job.getAddress(),
            job.getCity(),
            job.getLatitude(),
            job.getLongitude(),
            job.getMapAreaLabel(),
            job.getDistanceKm(),
            job.getEtaMinutes(),
            job.getTransitNote(),
            job.getAccessInstructions(),
            job.getPlacedAt(),
            job.getAcceptedAt(),
            job.getStartedAt(),
            job.getCompletedAt(),
            job.getScheduledStart(),
            job.getScheduledEnd(),
            job.getPaymentHold(),
            job.getServiceBaseFee(),
            job.getPartsTopUp(),
            job.getPlatformCommission(),
            job.getNetPayout(),
            job.getProgressLabel(),
            job.getProgressPercent(),
            job.getCompletionNotes(),
            diagnostics,
            photos,
            job.getChecklist() == null ? List.of() : job.getChecklist()
        );
    }
}
