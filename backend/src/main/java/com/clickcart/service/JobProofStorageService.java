package com.clickcart.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.clickcart.exception.ApiException;
import com.clickcart.model.JobPhoto;

@Service
public class JobProofStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/jpg");
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final Path root;

    public JobProofStorageService(@Value("${clickcart.upload.proof-dir:./data/job-proofs}") String proofDir) {
        this.root = Path.of(proofDir).toAbsolutePath().normalize();
    }

    public JobPhoto store(String jobId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("A photo file is required");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(contentType) && !hasImageExtension(file.getOriginalFilename())) {
            throw ApiException.badRequest("Only JPEG or PNG images are allowed");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("Image must be 10MB or smaller");
        }
        try {
            Path jobDir = root.resolve(jobId);
            Files.createDirectories(jobDir);
            String extension = extensionOf(file.getOriginalFilename(), contentType);
            String storedName = UUID.randomUUID() + extension;
            Path destination = jobDir.resolve(storedName);
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            JobPhoto photo = new JobPhoto();
            photo.setId(UUID.randomUUID().toString());
            photo.setOriginalName(file.getOriginalFilename() == null ? storedName : file.getOriginalFilename());
            photo.setStoredName(storedName);
            photo.setContentType(contentType.isBlank() ? "image/jpeg" : contentType);
            photo.setSizeBytes(file.getSize());
            photo.setUploadedAt(Instant.now());
            return photo;
        } catch (IOException exception) {
            throw ApiException.badRequest("Unable to store the uploaded photo");
        }
    }

    public Path resolve(String jobId, String storedName) {
        Path path = root.resolve(jobId).resolve(storedName).normalize();
        if (!path.startsWith(root)) {
            throw ApiException.badRequest("Invalid file path");
        }
        return path;
    }

    private static boolean hasImageExtension(String name) {
        if (name == null) {
            return false;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
    }

    private static String extensionOf(String originalName, String contentType) {
        if (originalName != null && originalName.toLowerCase(Locale.ROOT).endsWith(".png")) {
            return ".png";
        }
        if ("image/png".equals(contentType)) {
            return ".png";
        }
        return ".jpg";
    }
}
