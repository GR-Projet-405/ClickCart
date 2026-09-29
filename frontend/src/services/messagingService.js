import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const messagingService = {
  createOrFindConversation: async (providerId, extras = {}) => {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ providerId, ...extras })
    });
    if (!response.ok) throw new Error('Failed to create/find conversation');
    return response.json();
  },
  
  listConversations: async (role, page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/conversations?role=${role}&page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to list conversations');
    return response.json();
  },
  
  getConversationDetail: async (conversationId, page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get conversation detail');
    return response.json();
  },
  
  getMessages: async (conversationId, page = 0, size = 20) => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get messages');
    return response.json();
  },
  
  sendMessage: async (conversationId, content) => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },
  
  markAsRead: async (conversationId) => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    return true;
  },
};
