import React from 'react';
import { Star, MapPin, Clock, CheckCircle, Sparkles, Lightbulb } from 'lucide-react';

export default function RecommendedProviderCard({ provider, onShowBreakdown, onBookNow, onShowProfile }) {
  return (
    <article className="dev15-provider-card">
      <div className="dev15-card-image-wrapper">
        {provider.image ? (
          <img src={provider.image} alt={provider.name} className="dev15-provider-img" />
        ) : (
          <div className="dev15-img-fallback" />
        )}

        <div className="dev15-badge-overlay">
          <button
            type="button"
            className="dev15-match-badge dev15-clickable-badge"
            onClick={() => onShowBreakdown?.(provider)}
            title="Click to view match score calculation"
          >
            <Sparkles size={14} /> {provider.matchScore}% Match
          </button>

          {provider.isVerified && (
            <span className="dev15-verified-badge">
              <CheckCircle size={14} /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="dev15-card-content">
        <h3>{provider.name}</h3>
        <p className="dev15-service-name">{provider.service}</p>

        <ul className="dev15-meta-list">
          <li>
            <Star size={16} className="dev15-icon-star" /> {provider.rating} ({provider.reviewCount}{' '}
            reviews)
          </li>
          <li>
            <MapPin size={16} className="dev15-icon-muted" /> {provider.distance} km away
          </li>
          <li>
            <Clock size={16} className="dev15-icon-muted" /> {provider.availability}
          </li>
        </ul>

        <div className="dev15-matched-reason">
          <Lightbulb size={16} />
          <p>{provider.matchedTag}</p>
        </div>

        <div className="dev15-card-footer">
          <div className="dev15-price">
            <span className="dev15-price-label">Starting from</span>
            <strong>LKR {provider.startingPrice.toLocaleString()}</strong>
          </div>
          <div className="dev15-actions">
            <button 
              type="button" 
              className="dev15-btn-secondary"
              onClick={() => onShowProfile?.(provider)}
            >
              Profile
            </button>
            <button type="button" className="dev15-btn-primary" onClick={() => onBookNow?.(provider)}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}