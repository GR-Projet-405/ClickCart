package com.clickcart.service;

import java.io.IOException;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.clickcart.exception.ApiException;

/** Private file bytes; callers must authorize the conversation/job before accessing storage. */
@Service
public class PrivateUploadStorage {
    private final GridFsTemplate files;

    public PrivateUploadStorage(GridFsTemplate files) { this.files = files; }

    public String store(String scope, String parentId, MultipartFile file) throws IOException {
        try (var input = file.getInputStream()) {
            var id = files.store(input, "upload", file.getContentType(),
                    new Document("uploadScope", scope).append("parentId", parentId));
            return "gridfs-" + id.toHexString();
        }
    }

    public Resource read(String scope, String parentId, String reference) {
        if (reference == null || !reference.startsWith("gridfs-")) throw ApiException.notFound("File not found");
        String id = reference.substring("gridfs-".length());
        if (!ObjectId.isValid(id)) throw ApiException.notFound("File not found");
        var file = files.findOne(Query.query(Criteria.where("_id").is(new ObjectId(id))
                .and("metadata.uploadScope").is(scope).and("metadata.parentId").is(parentId)));
        if (file == null) throw ApiException.notFound("File not found");
        return files.getResource(file);
    }
}
