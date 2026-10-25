import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isMine, avatar }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
      {!isMine && (
        <div className="message-avatar">
          {avatar ? <img src={avatar} alt="avatar" /> : <div className="avatar-placeholder" />}
        </div>
      )}
      <div className="message-content">
        <div className="message-bubble">
          <p>{message.content}</p>
        </div>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {isMine && (
            <span className="message-status">
              {message.readAt ? <CheckCheck size={14} className="read-icon" /> : <Check size={14} className="sent-icon" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
