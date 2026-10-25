package com.clickcart.dto.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for sending a new message into a conversation.
 *
 * <p>Used by both the REST endpoint ({@code POST /api/conversations/{id}/messages})
 * and the WebSocket STOMP handler. Validation is enforced at the controller/handler
 * boundary before the service layer is invoked.</p>
 */
public class SendMessageRequest {

    /**
     * Text body of the message.
     * Must not be blank and must not exceed 2 000 characters.
     */
    @NotBlank(message = "Message content must not be blank")
    @Size(max = 2000, message = "Message content must not exceed 2000 characters")
    private String content;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public SendMessageRequest() {
    }

    public SendMessageRequest(String content) {
        this.content = content;
    }

    // -----------------------------------------------------------------------
    // Getters and setters
    // -----------------------------------------------------------------------

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
