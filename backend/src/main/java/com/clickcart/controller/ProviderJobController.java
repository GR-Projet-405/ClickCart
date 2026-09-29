package com.clickcart.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.clickcart.dto.CompleteJobRequest;
import com.clickcart.dto.ProviderJobDetailDto;
import com.clickcart.dto.ProviderJobSummaryDto;
import com.clickcart.exception.ApiException;
import com.clickcart.model.JobStatus;
import com.clickcart.service.ProviderJobService;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/provider/jobs")
public class ProviderJobController {

    private final ProviderJobService providerJobService;

    public ProviderJobController(ProviderJobService providerJobService) {
        this.providerJobService = providerJobService;
    }

    @GetMapping
    public List<ProviderJobSummaryDto> list(@RequestParam(required = false) String status) {
        return providerJobService.listJobs(parseStatus(status));
    }

    @GetMapping("/{jobId}")
    public ProviderJobDetailDto get(@PathVariable String jobId) {
        return providerJobService.getJob(jobId);
    }

    @PutMapping("/{jobId}/accept")
    public ProviderJobDetailDto accept(@PathVariable String jobId) {
        return providerJobService.acceptJob(jobId);
    }

    @PutMapping("/{jobId}/start")
    public ProviderJobDetailDto start(@PathVariable String jobId) {
        return providerJobService.startJob(jobId);
    }

    @PostMapping(path = "/{jobId}/proofs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProviderJobDetailDto uploadProof(
        @PathVariable String jobId,
        @RequestParam("file") MultipartFile file
    ) {
        return providerJobService.uploadProof(jobId, file);
    }

    @PutMapping("/{jobId}/complete")
    public ProviderJobDetailDto complete(
        @PathVariable String jobId,
        @RequestBody(required = false) CompleteJobRequest request
    ) {
        return providerJobService.completeJob(jobId, request);
    }

    @GetMapping("/{jobId}/proofs/{photoId}")
    public ResponseEntity<Resource> proof(@PathVariable String jobId, @PathVariable String photoId) {
        Resource resource = providerJobService.loadProof(jobId, photoId);
        MediaType mediaType = providerJobService.mediaTypeFor(jobId, photoId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
            .contentType(mediaType)
            .body(resource);
    }

    private static JobStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        try {
            return JobStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("Unknown job status");
        }
    }
}
