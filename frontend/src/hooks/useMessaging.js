import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService } from '../services/messagingService';
import { useStompClient } from './useStompClient';

export const useMessaging = (role, currentUserId) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const { connected, connectionState, subscribe, send } = useStompClient();
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation?.id;
  }, [activeConversation]);

  const loadConversations = useCallback(async (page = 0, size = 20) => {
    try {
      setListLoading(true);
      setListError(null);
      const data = await messagingService.listConversations(role, page, size);
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      // Keep any previously loaded conversations visible; just report the failure
      setListError(err.message || 'Could not load your conversations.');
    } finally {
      setListLoading(false);
    }
  }, [role]);

  const loadConversation = useCallback(async (conversationId, page = 0, size = 20) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setSendError(null);
      const data = await messagingService.getConversationDetail(conversationId, page, size);
      setActiveConversation({
        id: data.id,
        customerId: data.customerId,
        providerId: data.providerId,
        serviceId: data.serviceId,
        bookingId: data.bookingId,
        otherPartyName: data.otherPartyName,
        otherPartyAvatarUrl: data.otherPartyAvatarUrl,
      });
      
      setMessages(data.messages?.messages || []);
    } catch (err) {
      setDetailError(err.message || 'Could not open this conversation.');
      return;
    } finally {
      setDetailLoading(false);
    }

    // Only clear the local unread badge once the server confirms the read
    try {
      await messagingService.markAsRead(conversationId);
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch {
      /* non-critical: badge stays until next refresh */
    }
  }, []);

  /**
   * Sends a message over REST so failures are reported back to the user.
   * Live delivery to other participants still happens through the WebSocket
   * topic subscription below (duplicates are ignored by message id).
   *
   * @returns {Promise<boolean>} true when the message was accepted by the server
   */
  const sendMessage = useCallback(async (conversationId, content) => {
    setSendError(null);
    try {
      const newMsg = await messagingService.sendMessage(conversationId, content);

      setMessages(prev => {
        if (newMsg?.id && prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      setConversations(prev => prev.map(c => {
         if (c.id === conversationId) {
           return {
             ...c,
             lastMessageText: content,
             lastMessageAt: newMsg?.createdAt ?? c.lastMessageAt
           };
         }
         return c;
      }));
      return true;
    } catch (err) {
      setSendError(err.message || 'Your message could not be sent.');
      return false;
    }
  }, []);

  const clearSendError = useCallback(() => setSendError(null), []);

  useEffect(() => {
    if (!connected || !currentUserId) return;

    const unreadSub = subscribe(`/user/${currentUserId}/queue/unread`, (update) => {
      setConversations(prev => prev.map(c => 
        c.id === update.conversationId ? { ...c, unreadCount: update.unreadCount } : c
      ));
    });

    return () => {
      if (unreadSub) unreadSub.unsubscribe();
    };
  }, [connected, currentUserId, subscribe]);

  useEffect(() => {
    if (!connected || !activeConversation) return;

    const convId = activeConversation.id;
    const msgSub = subscribe(`/topic/conversations/${convId}`, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      
      setConversations(prev => prev.map(c => {
         if (c.id === convId) {
           return {
             ...c,
             lastMessageText: newMsg.content,
             lastMessageAt: newMsg.createdAt
           };
         }
         return c;
      }));

      if (activeConversationRef.current === convId && newMsg.senderId !== currentUserId) {
        send(`/app/conversations/${convId}/read`, {});
      }
    });

    return () => {
      if (msgSub) msgSub.unsubscribe();
    };
  }, [connected, activeConversation, subscribe, currentUserId, send]);

  return {
    conversations,
    activeConversation,
    messages,
    loading: listLoading || detailLoading,
    listLoading,
    detailLoading,
    error: listError || detailError,
    listError,
    detailError,
    sendError,
    clearSendError,
    connected,
    connectionState,
    loadConversations,
    retryLoadConversations: () => loadConversations(0, 20),
    loadConversation,
    sendMessage,
  };
};
