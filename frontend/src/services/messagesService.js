import { API_BASE_URL } from "../config/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.message) msg = body.message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── Conversations ─────────────────────────────────────────────────────────────

/**
 * Fetch all conversations for a user.
 * @param {string} userId
 * @param {"CUSTOMER"|"PROVIDER"} role
 */
export async function fetchConversations(userId, role) {
  const res = await fetch(
    `${API_BASE_URL}/conversations?userId=${encodeURIComponent(userId)}&role=${role}`
  );
  return handleResponse(res);
}

/**
 * Create a conversation for a booking (idempotent — returns existing if one exists).
 * @param {object} data  CreateConversationRequest fields
 */
export async function createConversation(data) {
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Fetch booking status events for a conversation.
 * @param {string} conversationId
 * @param {string} userId
 * @param {"CUSTOMER"|"PROVIDER"} role
 */
export async function fetchBookingEvents(conversationId, userId, role) {
  const res = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/events?userId=${encodeURIComponent(userId)}&role=${role}`
  );
  return handleResponse(res);
}

/**
 * Mark all messages in a conversation as read for the caller.
 */
export async function markConversationRead(conversationId, userId, role) {
  const res = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/read?userId=${encodeURIComponent(userId)}&role=${role}`,
    { method: "PATCH" }
  );
  return handleResponse(res);
}

// ── Messages ──────────────────────────────────────────────────────────────────

/**
 * Fetch all messages for a conversation.
 */
export async function fetchMessages(conversationId, userId, role) {
  const res = await fetch(
    `${API_BASE_URL}/messages?conversationId=${conversationId}&userId=${encodeURIComponent(userId)}&role=${role}`
  );
  return handleResponse(res);
}

/**
 * Send a text message.
 * @param {object} data  { conversationId, content, type: "TEXT" }
 * @param {string} userId
 * @param {"CUSTOMER"|"PROVIDER"} role
 */
export async function sendMessage(data, userId, role) {
  const res = await fetch(
    `${API_BASE_URL}/messages?userId=${encodeURIComponent(userId)}&role=${role}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, senderId: userId, senderRole: role }),
    }
  );
  return handleResponse(res);
}

/**
 * Upload a file attachment.
 * @param {string} conversationId
 * @param {File} file
 * @param {string} userId
 * @param {"CUSTOMER"|"PROVIDER"} role
 * @param {function} onProgress  — called with 0-100 progress if XHR is used
 */
export function uploadAttachment(conversationId, file, userId, role, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${API_BASE_URL}/messages/attachments?conversationId=${conversationId}&userId=${encodeURIComponent(userId)}&role=${role}`
    );

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(null);
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.message) msg = body.message;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

/**
 * Build the URL to download/view an attachment.
 */
export function attachmentDownloadUrl(messageId, userId, role) {
  return `${API_BASE_URL}/messages/${messageId}/attachment?userId=${encodeURIComponent(userId)}&role=${role}`;
}
