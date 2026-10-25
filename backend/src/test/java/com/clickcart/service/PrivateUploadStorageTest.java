package com.clickcart.service;

import com.clickcart.exception.ApiException;
import com.clickcart.model.Message;
import com.clickcart.repository.MessageRepository;
import com.clickcart.repository.ConversationRepository;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.mock.web.MockMultipartFile;
import java.io.InputStream;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PrivateUploadStorageTest {
    @Test void storedReferenceCanBeReadByAnotherStorageInstance() {
        var grid = mock(GridFsTemplate.class);
        var file = mock(com.mongodb.client.gridfs.model.GridFSFile.class);
        var resource = mock(org.springframework.data.mongodb.gridfs.GridFsResource.class);
        when(grid.findOne(any(Query.class))).thenReturn(file);
        when(grid.getResource(file)).thenReturn(resource);
        assertSame(resource, new PrivateUploadStorage(grid).read("conversation", "conversation-1",
                "gridfs-" + new ObjectId().toHexString()));
    }

    @Test void storesBytesAndParentMetadataInMongo() throws Exception {
        var grid = mock(GridFsTemplate.class);
        var id = new ObjectId();
        when(grid.store(any(InputStream.class), eq("upload"), eq("text/plain"), any(Document.class)))
                .thenAnswer(call -> {
                    assertArrayEquals("hello".getBytes(), ((InputStream) call.getArgument(0)).readAllBytes());
                    Document metadata = call.getArgument(3);
                    assertEquals("conversation", metadata.getString("uploadScope"));
                    assertEquals("conversation-1", metadata.getString("parentId"));
                    return id;
                });
        assertEquals("gridfs-" + id.toHexString(), new PrivateUploadStorage(grid).store(
                "conversation", "conversation-1", new MockMultipartFile("file", "note.txt", "text/plain", "hello".getBytes())));
    }

    @Test void readsAreBoundToBothParentAndUploadType() {
        var grid = mock(GridFsTemplate.class);
        var id = new ObjectId();
        assertThrows(ApiException.class, () -> new PrivateUploadStorage(grid)
                .read("job-proof", "job-2", "gridfs-" + id.toHexString()));
        var query = ArgumentCaptor.forClass(Query.class);
        verify(grid).findOne(query.capture());
        var fields = query.getValue().getQueryObject();
        assertEquals(id, fields.get("_id"));
        assertEquals("job-proof", fields.get("metadata.uploadScope"));
        assertEquals("job-2", fields.get("metadata.parentId"));
    }

    @Test void unauthorizedConversationDownloadNeverReadsFileStorage() {
        var messages = mock(MessageRepository.class);
        var conversations = mock(ConversationService.class);
        var uploads = mock(PrivateUploadStorage.class);
        var message = new Message();
        message.setConversationId("conversation-1");
        var info = new Message.AttachmentInfo();
        info.setStoredFilename("gridfs-" + new ObjectId().toHexString());
        message.setAttachment(info);
        when(messages.findById("message-1")).thenReturn(Optional.of(message));
        when(conversations.getConversation("conversation-1", "outsider", "CUSTOMER"))
                .thenThrow(ApiException.forbidden("Not a participant"));
        var service = new MessageService(messages, mock(ConversationRepository.class), conversations,
                mock(NotificationService.class), uploads);
        assertThrows(ApiException.class, () -> service.getAttachmentResource("message-1", "outsider", "CUSTOMER"));
        verifyNoInteractions(uploads);
    }

    @Test void newProofsUsePersistentStorage() throws Exception {
        var uploads = mock(PrivateUploadStorage.class);
        var file = new MockMultipartFile("file", "proof.png", "image/png", new byte[]{1, 2});
        when(uploads.store("job-proof", "job-1", file)).thenReturn("gridfs-test-reference");
        var photo = new JobProofStorageService("unused-local-directory", uploads).store("job-1", file);
        assertEquals("gridfs-test-reference", photo.getStoredName());
        verify(uploads).store("job-proof", "job-1", file);
    }
}
