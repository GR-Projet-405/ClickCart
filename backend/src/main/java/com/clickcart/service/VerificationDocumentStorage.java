package com.clickcart.service;

import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.UnauthorizedException;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.util.Set;

@Service
public class VerificationDocumentStorage {
    private final GridFsTemplate files;
    public VerificationDocumentStorage(GridFsTemplate files) { this.files = files; }
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 5 * 1024 * 1024
            || !Set.of("image/jpeg", "image/png", "image/webp", "application/pdf").contains(file.getContentType() == null ? "" : file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each document must be a JPG, PNG, WebP or PDF file up to 5 MB");
        }
    }
    public String store(String ownerId, String type, MultipartFile file) throws IOException {
        validate(file);
        try (var input = file.getInputStream()) {
            ObjectId id = files.store(input, type, file.getContentType(), new Document("ownerId", ownerId).append("documentType", type));
            return "/api/provider-verification/documents/" + id.toHexString();
        }
    }
    public GridFsResource read(String id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) throw new UnauthorizedException("Authentication required");
        if (!ObjectId.isValid(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        GridFSFile file = files.findOne(Query.query(Criteria.where("_id").is(new ObjectId(id))));
        if (file == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> "ROLE_PLATFORM_ADMIN".equals(a.getAuthority()));
        if (!admin && (file.getMetadata() == null || !auth.getName().equals(file.getMetadata().getString("ownerId")))) throw new ForbiddenException("This document belongs to another account");
        return files.getResource(file);
    }
    public void remove(String url) {
        String id = url.substring(url.lastIndexOf('/') + 1);
        if (ObjectId.isValid(id)) files.delete(Query.query(Criteria.where("_id").is(new ObjectId(id))));
    }
}
