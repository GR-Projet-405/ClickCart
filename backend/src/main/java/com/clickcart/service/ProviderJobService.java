package com.clickcart.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.clickcart.dto.CompleteJobRequest;
import com.clickcart.dto.ProviderJobDetailDto;
import com.clickcart.dto.ProviderJobSummaryDto;
import com.clickcart.exception.ApiException;
import com.clickcart.model.JobPhoto;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.repository.ProviderJobRepository;
import com.clickcart.security.ProviderContext;
import com.clickcart.security.ProviderPrincipal;

@Service
public class ProviderJobService {

    private final ProviderJobRepository repository;
    private final JobProofStorageService storageService;

    public ProviderJobService(ProviderJobRepository repository, JobProofStorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    public List<ProviderJobSummaryDto> listJobs(JobStatus status) {
        String providerId = currentProvider().providerId();
        List<ProviderJob> jobs = status == null
            ? repository.findByProviderIdOrderByScheduledStartAsc(providerId)
            : repository.findByProviderIdAndStatusOrderByScheduledStartAsc(providerId, status);
        return jobs.stream().map(this::toSummary).toList();
    }

    public ProviderJobDetailDto getJob(String jobId) {
        return toDetail(requireOwnedJob(jobId));
    }

    public ProviderJobDetailDto acceptJob(String jobId) {
        ProviderJob job = requireOwnedJob(jobId);
        requireStatus(job, JobStatus.PLACED, "Only placed jobs can be accepted");
        Instant now = Instant.now();
        job.setStatus(JobStatus.ACCEPTED);
        job.setAcceptedAt(now);
        job.setProgressLabel("Accepted by provider");
        job.setProgressPercent(40);
        job.setUpdatedAt(now);
        return toDetail(repository.save(job));
    }

    public ProviderJobDetailDto startJob(String jobId) {
        ProviderJob job = requireOwnedJob(jobId);
        requireStatus(job, JobStatus.ACCEPTED, "Only accepted jobs can be started");
        Instant now = Instant.now();
        job.setStatus(JobStatus.IN_PROGRESS);
        job.setStartedAt(now);
        job.setProgressLabel("On site servicing");
        job.setProgressPercent(70);
        job.setUpdatedAt(now);
        return toDetail(repository.save(job));
    }

    public ProviderJobDetailDto uploadProof(String jobId, MultipartFile file) {
        ProviderJob job = requireOwnedJob(jobId);
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

    public ProviderJobDetailDto completeJob(String jobId, CompleteJobRequest request) {
        ProviderJob job = requireOwnedJob(jobId);
        requireStatus(job, JobStatus.IN_PROGRESS, "Only in-progress jobs can be marked complete");
        if (job.getPhotos() == null || job.getPhotos().isEmpty()) {
            throw ApiException.badRequest("Upload at least one photographic proof before completing the job");
        }
        Instant now = Instant.now();
        job.setStatus(JobStatus.COMPLETED);
        job.setCompletedAt(now);
        job.setProgressLabel("Completed");
        job.setProgressPercent(100);
        if (request != null && request.completionNotes() != null && !request.completionNotes().isBlank()) {
            job.setCompletionNotes(request.completionNotes().trim());
        }
        job.setUpdatedAt(now);
        return toDetail(repository.save(job));
    }

    public Resource loadProof(String jobId, String photoId) {
        ProviderJob job = requireOwnedJob(jobId);
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

    public MediaType mediaTypeFor(String jobId, String photoId) {
        ProviderJob job = requireOwnedJob(jobId);
        JobPhoto photo = job.getPhotos().stream()
            .filter(item -> photoId.equals(item.getId()))
            .findFirst()
            .orElseThrow(() -> ApiException.notFound("Photo not found"));
        if (photo.getContentType() == null || photo.getContentType().isBlank()) {
            return MediaType.IMAGE_JPEG;
        }
        return MediaType.parseMediaType(photo.getContentType());
    }

    private ProviderJob requireOwnedJob(String jobId) {
        ProviderJob job = repository.findById(jobId)
            .orElseThrow(() -> ApiException.notFound("Job not found"));
        if (!currentProvider().providerId().equals(job.getProviderId())) {
            throw ApiException.forbidden("You are not allowed to access this job");
        }
        return job;
    }

    private static void requireStatus(ProviderJob job, JobStatus expected, String message) {
        if (job.getStatus() != expected) {
            throw ApiException.badRequest(message);
        }
    }

    private ProviderPrincipal currentProvider() {
        return ProviderContext.require();
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
