import React, { useRef, useEffect } from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Search, Phone, Info, MoreVertical, ShieldCheck, Calendar } from 'lucide-react';
import './ChatWindow.css';

export default function ChatWindow({ conversation, messages, currentUserId, onSendMessage }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const otherName = conversation?.otherPartyName || 'User';

  return (
    <div className="chat-window">
      {/* Trust & Safety Banner */}
      <div className="trust-banner">
        <ShieldCheck size={16} className="text-primary-color" />
        <span>Realtime Sync Active • ClickCart End-to-End Escrow Protection</span>
      </div>

      <div className="chat-header">
        <div className="header-left">
          <Avatar size="lg" name={otherName} />
          <div className="header-info">
            <h3>
              {otherName} <Badge variant="success" size="sm">Verified</Badge>
            </h3>
            <p className="status-text"><span className="status-dot online"></span> Active now</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn"><Search size={20} /></button>
          <button className="icon-btn"><Phone size={20} /></button>
          <button className="icon-btn"><Info size={20} /></button>
          <button className="icon-btn"><MoreVertical size={20} /></button>
        </div>
      </div>

      {conversation.bookingId && (
        <div className="booking-context-banner">
          <div className="booking-info">
            <div className="booking-icon"><Calendar size={20} /></div>
            <div>
              <h4>Active Booking • #{conversation.bookingId}</h4>
              <p><Badge variant="success" size="sm">Confirmed</Badge></p>
            </div>
          </div>
          <button className="view-booking-btn">View Booking →</button>
        </div>
      )}

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, index) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <MessageBubble 
              key={msg.id || index}
              message={msg}
              isMine={isMine}
              avatar={isMine ? null : conversation.otherPartyAvatarUrl}
            />
          );
        })}
      </div>

      <div className="chat-input-area">
        <MessageInput 
          onSend={onSendMessage} 
          placeholder={`Type your message to ${otherName}... (Press Enter to send)`}
        />
        <div className="security-note">
          <ShieldCheck size={14} />
          <span>For your financial security and dispute coverage, keep all bookings and payments strictly inside ClickCart.</span>
        </div>
      </div>
    </div>
  );
}
