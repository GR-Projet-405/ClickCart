import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService } from '../services/messagingService';
import { useStompClient } from './useStompClient';

export const useMessaging = (role, currentUserId) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connected, subscribe, send } = useStompClient();
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation?.id;
  }, [activeConversation]);

  const loadConversations = useCallback(async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const data = await messagingService.listConversations(role, page, size);
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  const loadConversation = useCallback(async (conversationId, page = 0, size = 20) => {
    try {
      setLoading(true);
      const data = await messagingService.getConversationDetail(conversationId, page, size);
      setActiveConversation({
        id: data.id,
        customerId: data.customerId,
        providerId: data.providerId,
        serviceId: data.serviceId,
        bookingId: data.bookingId
      });
      
      setMessages(data.messages?.messages || []);
      
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
      
      await messagingService.markAsRead(conversationId);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessageRest = async (conversationId, content) => {
    try {
      const newMsg = await messagingService.sendMessage(conversationId, content);
      
      if (!connected) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        
        setConversations(prev => prev.map(c => {
           if (c.id === conversationId) {
             return {
               ...c,
               lastMessageText: content,
               lastMessageAt: newMsg.createdAt
             };
           }
           return c;
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessageWs = (conversationId, content) => {
    const sent = send(`/app/conversations/${conversationId}/send`, { content });
    if (!sent) {
       sendMessageRest(conversationId, content);
    }
  };

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
    loading,
    error,
    loadConversations,
    loadConversation,
    sendMessage: sendMessageWs,
  };
};
