import React, { useRef, useEffect } from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Search, Phone, Info, MoreVertical, ShieldCheck, Calendar, WifiOff, RefreshCw } from 'lucide-react';
import './ChatWindow.css';

const INACTIVE_BOOKING_STATUSES = ['completed', 'cancelled', 'canceled'];

function ConnectionBanner({ connectionState }) {
  if (connectionState === 'connected') {
    return (
      <div className="trust-banner" id="chat-connection-banner">
        <ShieldCheck size={16} className="text-primary-color" aria-hidden="true" />
        <span>Live updates on • ClickCart End-to-End Escrow Protection</span>
      </div>
    );
  }

  const offline = connectionState === 'offline';
  return (
    <div
      className={`trust-banner ${offline ? 'trust-banner--offline' : 'trust-banner--warning'}`}
      id="chat-connection-banner"
      role="status"
      aria-live="polite"
    >
      {offline
        ? <WifiOff size={16} aria-hidden="true" />
        : <RefreshCw size={16} className="trust-banner__spin" aria-hidden="true" />}
      <span>
        {offline
          ? "You're offline. Live updates are paused — new replies will appear when you reconnect."
          : 'Reconnecting… You can still send messages, but new replies may be delayed.'}
      </span>
    </div>
  );
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  connectionState = 'connecting',
  sendError,
  onDismissSendError,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const otherName = conversation?.otherPartyName || 'Conversation';
  const bookingStatus = conversation?.bookingStatus;
  const bookingIsActive = !bookingStatus
    || !INACTIVE_BOOKING_STATUSES.includes(String(bookingStatus).toLowerCase());

  return (
    <div className="chat-window">
      {/* Connection / Trust & Safety Banner */}
      <ConnectionBanner connectionState={connectionState} />

      <div className="chat-header">
        <div className="header-left">
          <Avatar size="lg" name={otherName} src={conversation?.otherPartyAvatarUrl} />
          <div className="header-info">
            <h3 className="chat-header__name" id="chat-header-name">{otherName}</h3>
            <p className="status-text">
              {conversation?.bookingId ? `Booking #${conversation.bookingId}` : 'Direct message'}
            </p>
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
              <h4>{bookingIsActive ? 'Active Booking' : 'Booking'} • #{conversation.bookingId}</h4>
              {bookingStatus && (
                <p><Badge variant={bookingIsActive ? 'success' : 'neutral'} size="sm">{bookingStatus}</Badge></p>
              )}
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
          placeholder={`Message ${otherName}...`}
          error={sendError}
          onDismissError={onDismissSendError}
        />
        <div className="security-note">
          <ShieldCheck size={14} />
          <span>For your financial security and dispute coverage, keep all bookings and payments strictly inside ClickCart.</span>
        </div>
      </div>
    </div>
  );
}
