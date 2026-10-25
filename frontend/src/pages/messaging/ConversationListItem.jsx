import React from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { Check } from 'lucide-react';

export default function ConversationListItem({ conversation, isActive, onClick }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="item-avatar-wrapper">
        <Avatar 
          src={conversation.otherPartyAvatarUrl} 
          name={conversation.otherPartyName || 'Unknown User'} 
          size="md" 
        />
        <div className="status-indicator online"></div>
      </div>
      
      <div className="item-content">
        <div className="item-header">
          <div className="item-name-row">
            <span className="item-name">{conversation.otherPartyName || 'Unknown User'}</span>
            <Check size={14} className="verified-icon" />
          </div>
          <span className="item-time">{formatTime(conversation.lastMessageAt)}</span>
        </div>
        
        <div className="item-roles">
          <Badge variant="secondary" size="sm">MEMBER</Badge>
        </div>
        
        <div className="item-footer">
          <p className="item-preview">{conversation.lastMessageText || 'No messages yet'}</p>
          {conversation.unreadCount > 0 && (
            <span className="item-unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
        
        {conversation.bookingId && (
          <div className="item-meta">
            <div className="booking-tag">
              <span className="status-dot-sm"></span> #{conversation.bookingId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
