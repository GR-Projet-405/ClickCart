import React, { useState } from 'react';
import { Paperclip, Camera, Smile, Mic, Send } from 'lucide-react';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';

export default function MessageInput({ onSend, placeholder }) {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim()) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
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
        />
      </div>
      <div className="input-actions-right">
        <Button 
          onClick={handleSend} 
          disabled={!content.trim()}
          className="send-btn"
          icon={<Send size={16} />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
