import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessaging } from '../../hooks/useMessaging';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import ConversationListItem from './ConversationListItem';
import ChatWindow from './ChatWindow';
import { MessageSquare, Settings2, Edit } from 'lucide-react';
import './ConversationsPage.css';

export default function ConversationsPage({ role }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  // We assume a hardcoded currentUserId for now if auth is not fully wired
  const currentUserId = role === 'CUSTOMER' ? 'cust_123' : 'prov_123';
  
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    loadConversations,
    loadConversation,
    sendMessage
  } = useMessaging(role, currentUserId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadConversations(0, 20);
  }, [loadConversations, role]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation]);

  const filteredConversations = conversations.filter(c => {
    if (filter === 'Unread' && c.unreadCount === 0) return false;
    if (searchQuery && !c.otherPartyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectConversation = (id) => {
    navigate(role === 'CUSTOMER' ? `/messages/${id}` : `/provider/messages/${id}`);
  };

  return (
    <div className="conversations-page-container">
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <div className="header-title-row">
            <h2>Messages <span className="unread-total">{conversations.filter(c => c.unreadCount > 0).length || ''}</span></h2>
            <div className="header-actions">
              <button className="icon-action-btn"><Settings2 size={18} /></button>
              <button className="icon-action-btn"><Edit size={18} /></button>
            </div>
          </div>
          <div className="search-container">
            <SearchInput 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-chips">
            {['All', 'Unread', 'Active Bookings', 'Archived'].map(f => (
              <button 
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f} {f === 'Unread' && <span className="chip-count">2</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="conversations-list">
          {loading && !conversations.length ? (
            <div className="loading-state"><Spinner /></div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <ConversationListItem 
                key={conv.id}
                conversation={conv}
                isActive={conversationId === conv.id}
                onClick={() => handleSelectConversation(conv.id)}
              />
            ))
          ) : (
            <EmptyState 
              icon={<MessageSquare />}
              title="No messages found"
              description="You don't have any matching conversations."
            />
          )}
        </div>
      </div>

      <div className="chat-area">
        {conversationId && activeConversation ? (
          <ChatWindow 
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={(content) => sendMessage(conversationId, content)}
          />
        ) : (
          <div className="empty-chat-area">
            <EmptyState 
              icon={<MessageSquare />}
              title="Your Messages"
              description="Select a conversation from the sidebar to view details or send a new message."
            />
          </div>
        )}
      </div>
    </div>
  );
}
