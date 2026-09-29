import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import './InstantDispatchModal.css';

export default function InstantDispatchModal({ provider, onClose, onSuccess }) {
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow, 9:00 AM - 11:00 AM');
  const [address, setAddress] = useState('No. 42, Galle Road, Panadura');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!provider) return null;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Simulate backend call success
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 2000);
  };

  return (
    <div className="dev15-modal-overlay" onClick={onClose}>
      <div className="dev15-modal-content dev15-dispatch-modal" onClick={(e) => e.stopPropagation()}>
        
        <header className="dev15-modal-header">
          <div>
            <span className="dev15-badge-text">INSTANT DISPATCH</span>
            <h2>Book {provider.name}</h2>
          </div>
          <button className="dev15-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {isSubmitted ? (
          <div className="dev15-success-state">
            <div className="dev15-success-icon-wrap">
              <CheckCircle size={48} />
            </div>
            <h3>Dispatch Request Confirmed!</h3>
            <p>Your job has been securely routed to {provider.name}. They have 15 minutes to accept the dispatch slot.</p>
            <span className="dev15-dispatch-id">Dispatch Ref: #CC-{Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="dev15-dispatch-form">
            
            <div className="dev15-provider-summary-card">
              <span className="dev15-service-tag">{provider.service}</span>
              <div className="dev15-price-display">
                <span>Starting Rate</span>
                <strong>LKR {provider.startingPrice.toLocaleString()}</strong>
              </div>
            </div>

            <div className="dev15-form-group">
              <label><Calendar size={16} /> Select Live Dispatch Slot</label>
              <select 
                value={selectedSlot} 
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="dev15-form-select"
              >
                <option value="Today, 2:00 PM - 4:00 PM">Today, 2:00 PM - 4:00 PM (Emergency Slot)</option>
                <option value="Tomorrow, 9:00 AM - 11:00 AM">Tomorrow, 9:00 AM - 11:00 AM</option>
                <option value="Tomorrow, 2:00 PM - 4:00 PM">Tomorrow, 2:00 PM - 4:00 PM</option>
              </select>
            </div>

            <div className="dev15-form-group">
              <label><MapPin size={16} /> Service Location Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                required
                className="dev15-form-input"
              />
            </div>

            <div className="dev15-form-group">
              <label>Job Description / Special Instructions</label>
              <textarea 
                placeholder="Describe the issue briefly for the technician..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="dev15-form-textarea"
              />
            </div>

            <footer className="dev15-dispatch-footer">
              <button type="button" className="dev15-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="dev15-btn-primary dev15-submit-btn">
                Confirm & Dispatch <ArrowRight size={16} />
              </button>
            </footer>

          </form>
        )}

      </div>
    </div>
  );
}