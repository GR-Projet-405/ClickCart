package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.clickcart.exception.ApiException;
import com.clickcart.model.JobPhoto;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.repository.ProviderJobRepository;
import com.clickcart.security.ProviderContext;
import com.clickcart.security.ProviderPrincipal;

@ExtendWith(MockitoExtension.class)
class ProviderJobServiceTest {

    @Mock
    private ProviderJobRepository repository;

    @Mock
    private JobProofStorageService storageService;

    private ProviderJobService service;

    @BeforeEach
    void setUp() {
        service = new ProviderJobService(repository, storageService);
        ProviderContext.set(new ProviderPrincipal("provider-a", "Kavinda Silva", "SERVICE_PROVIDER"));
    }

    @AfterEach
    void tearDown() {
        ProviderContext.clear();
    }

    @Test
    void completeRejectsWhenNotInProgress() {
        ProviderJob job = ownedJob(JobStatus.PLACED);
        when(repository.findById("job-1")).thenReturn(Optional.of(job));
        ApiException exception = assertThrows(ApiException.class, () -> service.completeJob("job-1", null));
        assertEquals(400, exception.getStatus().value());
    }

    @Test
    void completeAllowsInProgressWithProof() {
        ProviderJob job = ownedJob(JobStatus.IN_PROGRESS);
        JobPhoto photo = new JobPhoto();
        photo.setId("p1");
        job.getPhotos().add(photo);
        when(repository.findById("job-1")).thenReturn(Optional.of(job));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertEquals(JobStatus.COMPLETED, service.completeJob("job-1", null).status());
        verify(repository).save(any());
    }

    @Test
    void startRejectsPlacedJobs() {
        ProviderJob job = ownedJob(JobStatus.PLACED);
        when(repository.findById("job-1")).thenReturn(Optional.of(job));
        ApiException exception = assertThrows(ApiException.class, () -> service.startJob("job-1"));
        assertEquals(400, exception.getStatus().value());
    }

    @Test
    void foreignJobIsForbidden() {
        ProviderJob job = ownedJob(JobStatus.IN_PROGRESS);
        job.setProviderId("provider-b");
        when(repository.findById("job-1")).thenReturn(Optional.of(job));
        ApiException exception = assertThrows(ApiException.class, () -> service.getJob("job-1"));
        assertEquals(403, exception.getStatus().value());
    }

    @Test
    void uploadRejectedWhenNotInProgress() {
        ProviderJob job = ownedJob(JobStatus.ACCEPTED);
        when(repository.findById("job-1")).thenReturn(Optional.of(job));
        MockMultipartFile file = new MockMultipartFile("file", "proof.jpg", "image/jpeg", new byte[] {1, 2, 3});
        ApiException exception = assertThrows(ApiException.class, () -> service.uploadProof("job-1", file));
        assertEquals(400, exception.getStatus().value());
    }

    private static ProviderJob ownedJob(JobStatus status) {
        ProviderJob job = new ProviderJob();
        job.setId("job-1");
        job.setProviderId("provider-a");
        job.setStatus(status);
        job.setPhotos(new ArrayList<>());
        job.setDiagnostics(new ArrayList<>());
        return job;
    }
}
