import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessaging } from '../../hooks/useMessaging';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import ConversationListItem from './ConversationListItem';
import ChatWindow from './ChatWindow';
import { MessageSquare, Settings2, Edit, AlertCircle, RefreshCw } from 'lucide-react';
import './ConversationsPage.css';

// Bookings in these states are no longer "active" for the Active Bookings filter
const INACTIVE_BOOKING_STATUSES = ['completed', 'cancelled', 'canceled'];

const hasActiveBooking = (c) => {
  if (!c.bookingId) return false;
  if (!c.bookingStatus) return true;
  return !INACTIVE_BOOKING_STATUSES.includes(String(c.bookingStatus).toLowerCase());
};

export default function ConversationsPage({ role }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  // We assume a hardcoded currentUserId for now if auth is not fully wired
  const currentUserId = role === 'CUSTOMER' ? 'cust_123' : 'prov_123';
  
  const {
    conversations,
    activeConversation,
    messages,
    listLoading,
    listError,
    detailError,
    sendError,
    clearSendError,
    connectionState,
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

  const unreadConversationCount = useMemo(
    () => conversations.filter(c => c.unreadCount > 0).length,
    [conversations]
  );

  const filteredConversations = conversations.filter(c => {
    if (filter === 'Unread' && !(c.unreadCount > 0)) return false;
    if (filter === 'Active Bookings' && !hasActiveBooking(c)) return false;
    if (filter === 'Archived' && !(c.isArchived || c.archived)) return false;
    if (searchQuery && !(c.otherPartyName ?? '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // The detail endpoint has no display metadata (name/avatar/booking status),
  // so merge in the matching list summary. Re-computes once the list arrives.
  const activeSummary = conversations.find(c => c.id === conversationId);
  const activeConversationView = activeConversation && activeConversation.id === conversationId
    ? {
        ...activeSummary,
        ...activeConversation,
        otherPartyName: activeConversation.otherPartyName || activeSummary?.otherPartyName,
        otherPartyAvatarUrl: activeConversation.otherPartyAvatarUrl || activeSummary?.otherPartyAvatarUrl,
        bookingStatus: activeConversation.bookingStatus || activeSummary?.bookingStatus,
      }
    : null;

  const handleSelectConversation = (id) => {
    navigate(role === 'CUSTOMER' ? `/messages/${id}` : `/provider/messages/${id}`);
  };

  return (
    <div className="conversations-page-container messaging-container" data-testid="messaging-container">
      <div className="conversations-sidebar messaging-panel" data-testid="messaging-panel">
        <div className="sidebar-header">
          <div className="header-title-row">
            <h2>Messages <span className="unread-total">{unreadConversationCount || ''}</span></h2>
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
                {f}{' '}
                {f === 'Unread' && unreadConversationCount > 0 && (
                  <span
                    className="chip-count"
                    aria-label={`${unreadConversationCount} unread conversation${unreadConversationCount === 1 ? '' : 's'}`}
                  >
                    {unreadConversationCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="conversations-list">
          {listError && (
            <div
              className="conversations-error messaging-panel-error messaging-panel"
              role="alert"
              id="conversations-load-error"
              data-testid="conversations-load-error"
            >
              <AlertCircle size={18} aria-hidden="true" />
              <div className="conversations-error__body">
                <p className="conversations-error__title">Couldn't load your conversations</p>
                <p className="conversations-error__message">{listError}</p>
              </div>
              <button
                type="button"
                id="conversations-retry"
                data-testid="conversations-retry"
                className="conversations-error__retry"
                onClick={() => loadConversations(0, 20)}
                disabled={listLoading}
                aria-label="Retry loading conversations"
              >
                <RefreshCw size={14} aria-hidden="true" /> {listLoading ? 'Retrying…' : 'Retry'}
              </button>
            </div>
          )}
          {listLoading && !conversations.length ? (
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
          ) : listError ? null : (
            <EmptyState 
              icon={<MessageSquare />}
              title="No messages found"
              description="You don't have any matching conversations."
            />
          )}
        </div>
      </div>

      <div className="chat-area">
        {conversationId && activeConversationView ? (
          <ChatWindow 
            conversation={activeConversationView}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={(content) => sendMessage(conversationId, content)}
            connectionState={connectionState}
            sendError={sendError}
            onDismissSendError={clearSendError}
          />
        ) : conversationId && detailError ? (
          <div className="empty-chat-area">
            <div
              className="conversations-error"
              role="alert"
              id="conversation-detail-error"
              data-testid="conversation-detail-error"
            >
              <AlertCircle size={18} aria-hidden="true" />
              <div className="conversations-error__body">
                <p className="conversations-error__title">Couldn't open this conversation</p>
                <p className="conversations-error__message">{detailError}</p>
              </div>
              <button
                type="button"
                id="conversation-detail-retry"
                data-testid="conversation-detail-retry"
                className="conversations-error__retry"
                onClick={() => loadConversation(conversationId)}
                aria-label="Retry loading conversation"
              >
                <RefreshCw size={14} aria-hidden="true" /> Retry
              </button>
            </div>
          </div>
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
