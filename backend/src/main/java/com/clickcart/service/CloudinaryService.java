package com.clickcart.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap("folder", "provider_documents")
        );

        return uploadResult.get("secure_url") != null 
                ? uploadResult.get("secure_url").toString() 
                : uploadResult.get("url").toString();
    }

    public String uploadMedia(MultipartFile file) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
            ObjectUtils.asMap("folder", "provider_service_media", "resource_type", "auto"));
        Object url = result.get("secure_url");
        if (url == null) throw new IOException("Media upload did not return a URL");
        return url.toString();
    }
}
