import React from 'react';
import { X, CheckCircle2, MapPin, History, Calendar, Award } from 'lucide-react';
import './MatchBreakdownModal.css';

export default function MatchBreakdownModal({ provider, onClose }) {
  if (!provider) return null;

  return (
    <div className="dev15-modal-overlay" onClick={onClose}>
      <div className="dev15-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <header className="dev15-modal-header">
          <div>
            <span className="dev15-badge-text">TRANSPARENT SCORING</span>
            <h2>Why {provider.name}?</h2>
          </div>
          <button className="dev15-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="dev15-score-summary-banner">
          <div className="dev15-big-score">{provider.matchScore}%</div>
          <div>
            <h3>Overall Algorithmic Fit</h3>
            <p>Computed dynamically based on location radius, past booking history, and active skill licensing.</p>
          </div>
        </div>

        <div className="dev15-breakdown-list">
          <div className="dev15-breakdown-item">
            <div className="dev15-breakdown-icon success"><MapPin size={18} /></div>
            <div className="dev15-breakdown-details">
              <h4>Geographic Proximity ({provider.distance} away)</h4>
              <p>Well within your primary operational zone with minimal travel time latency.</p>
            </div>
            <span className="dev15-weight-badge">35% weight</span>
          </div>

          <div className="dev15-breakdown-item">
            <div className="dev15-breakdown-icon success"><History size={18} /></div>
            <div className="dev15-breakdown-details">
              <h4>Service History Alignment</h4>
              <p>Matches category patterns from your past successful maintenance requests.</p>
            </div>
            <span className="dev15-weight-badge">30% weight</span>
          </div>

          <div className="dev15-breakdown-item">
            <div className="dev15-breakdown-icon success"><Calendar size={18} /></div>
            <div className="dev15-breakdown-details">
              <h4>Live Availability ({provider.availability})</h4>
              <p>Calendar sync confirms open slots matching your requested time frame.</p>
            </div>
            <span className="dev15-weight-badge">20% weight</span>
          </div>

          <div className="dev15-breakdown-item">
            <div className="dev15-breakdown-icon success"><Award size={18} /></div>
            <div className="dev15-breakdown-details">
              <h4>Verified Credential Rating ({provider.rating} ⭐)</h4>
              <p>Backed by {provider.reviewCount} verified local reviews and background checks.</p>
            </div>
            <span className="dev15-weight-badge">15% weight</span>
          </div>
        </div>

        <footer className="dev15-modal-footer">
          <p>💡 ClickCart never accepts paid promotion placements in recommendation rankings.</p>
          <button className="dev15-btn-primary" onClick={onClose}>Got it</button>
        </footer>

      </div>
    </div>
  );
}