import React, { useState } from 'react';
import { Paperclip, Camera, Smile, Mic, Send, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';

export default function MessageInput({ onSend, placeholder, error, onDismissError }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      // onSend resolves to false when the send failed — keep the draft so the user can retry
      const ok = await onSend(trimmed);
      if (ok !== false) setContent('');
    } catch {
      // preserve draft if onSend throws
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {error && (
        <div
          id="message-send-error"
          className="message-send-error"
          role="alert"
          data-testid="message-send-error"
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span className="message-send-error__text">
            {error} Your message has been kept so you can try again.
          </span>
          <button
            type="button"
            id="message-send-retry"
            data-testid="message-send-retry"
            className="message-send-error__action"
            onClick={handleSend}
            disabled={sending || !content.trim()}
          >
            Retry
          </button>
          {onDismissError && (
            <button
              type="button"
              className="message-send-error__action message-send-error__action--ghost"
              onClick={onDismissError}
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
      <div className="message-input-container">
        <div className="input-actions-left">
          <button className="icon-btn" title="Attach file"><Paperclip size={20} /></button>
          <button className="icon-btn" title="Camera"><Camera size={20} /></button>
          <button className="icon-btn" title="Emoji"><Smile size={20} /></button>
          <button className="icon-btn" title="Voice message"><Mic size={20} /></button>
        </div>
        <div className="input-wrapper">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type a message..."}
            className="chat-textarea"
            rows={1}
            aria-label="Message"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'message-send-error' : undefined}
          />
        </div>
        <div className="input-actions-right">
          <Button 
            onClick={handleSend} 
            disabled={!content.trim() || sending}
            className="send-btn"
            icon={<Send size={16} />}
          >
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </div>
    </>
  );
}
