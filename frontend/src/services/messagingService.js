import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Throws an Error with a user-friendly message (and the HTTP status) when the
 * response is not OK. Prefers the backend's `message` field when present.
 */
const ensureOk = async (response, fallbackMessage) => {
  if (response.ok) return response;

  let message = fallbackMessage;
  if (response.status === 401 || response.status === 403) {
    message = 'Your session has expired or you do not have access. Please sign in again.';
  } else if (response.status >= 500) {
    message = `${fallbackMessage} The server is having trouble right now.`;
  }
  try {
    const body = await response.json();
    if (body?.message) message = body.message;
  } catch {
    /* non-JSON body — keep fallback */
  }

  const error = new Error(message);
  error.status = response.status;
  throw error;
};

/** Wraps fetch so network failures also surface a readable message. */
const request = async (url, options, fallbackMessage) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(`${fallbackMessage} Please check your connection.`);
  }
  return ensureOk(response, fallbackMessage);
};

export const messagingService = {
  createOrFindConversation: async (providerIdOrPayload, options = {}) => {
    let providerId;
    let serviceId;
    let bookingId;

    if (typeof providerIdOrPayload === 'object' && providerIdOrPayload !== null) {
      providerId = providerIdOrPayload.providerId;
      serviceId = providerIdOrPayload.serviceId;
      bookingId = providerIdOrPayload.bookingId;
    } else {
      providerId = providerIdOrPayload;
      serviceId = options?.serviceId;
      bookingId = options?.bookingId;
    }

    const payload = { providerId };
    if (serviceId) payload.serviceId = serviceId;
    if (bookingId) payload.bookingId = bookingId;

    const response = await request(`${API_BASE_URL}/conversations/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }, 'Could not start the conversation.');
    return response.json();
  },
  
  listConversations: async (role, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    params.set('page', String(page));
    params.set('size', String(size));
    const response = await request(`${API_BASE_URL}/conversations/list?${params.toString()}`, {
      headers: getAuthHeaders(),
    }, 'Could not load your conversations.');
    return response.json();
  },
  
  getConversationDetail: async (conversationId, page = 0, size = 20) => {
    const response = await request(`${API_BASE_URL}/conversations/${conversationId}?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    }, 'Could not open this conversation.');
    return response.json();
  },
  
  getMessages: async (conversationId, page = 0, size = 20) => {
    const response = await request(`${API_BASE_URL}/conversations/${conversationId}/messages?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    }, 'Could not load messages.');
    return response.json();
  },
  
  sendMessage: async (conversationId, content) => {
    const response = await request(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    }, 'Your message could not be sent.');
    return response.json();
  },
  
  markAsRead: async (conversationId) => {
    await request(`${API_BASE_URL}/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }, 'Could not mark the conversation as read.');
    return true;
  },
};
