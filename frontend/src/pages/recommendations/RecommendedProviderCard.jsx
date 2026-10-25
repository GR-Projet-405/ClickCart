import React from 'react';
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Sparkles,
  Lightbulb
} from 'lucide-react';

export default function RecommendedProviderCard({
  provider,
  onShowBreakdown,
  onBookNow,
  onShowProfile
}) {
  const rating = Number(provider.rating) || 0;
  const reviewCount = Number(provider.reviewCount) || 0;
  const distance = Number(provider.distanceKm || provider.distance) || 0;
  const startingPrice = Number(provider.startingPrice) || 0;
  const matchScore = Number(provider.matchScore) || 0;

  const providerName = provider.businessName || provider.name || 'Service Provider';
  const service = provider.serviceCategory || provider.service || provider.category || 'Service';
  const availability = provider.availability || 'Available on request';
  const matchedReason = provider.matchedTag || provider.explainability?.requirementFit || 'Matches your residential service profile.';
  const isVerified = provider.isVerified === true || provider.verified === true;

  return (
    <article className="dev15-provider-card">
      {/* Provider Image & Badges */}
      <div className="dev15-card-image-placeholder">
        {provider.image ? (
          <img src={provider.image} alt={providerName} className="dev15-provider-image" />
        ) : (
          <div className="dev15-provider-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No Image
          </div>
        )}

        {/* Match Badge */}
        <button
          type="button"
          className="dev15-match-badge"
          onClick={() => onShowBreakdown?.(provider)}
          title="Click to view match score calculation"
        >
          <Sparkles size={14} />
          {matchScore}% Match
        </button>

        {/* Verified Badge */}
        {isVerified && (
          <span className="dev15-verified-badge">
            <CheckCircle size={14} style={{ color: '#16a34a' }} />
            Verified
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="dev15-card-content">
        <h3>{providerName}</h3>
        <p className="dev15-service-name">{service}</p>

        {/* Provider Information */}
        <ul className="dev15-meta-list">
          <li>
            <Star size={16} className="dev15-icon-star" />
            {rating.toFixed(1)} ({reviewCount} reviews)
          </li>
          <li>
            <MapPin size={16} className="dev15-icon-muted" />
            {distance.toFixed(1)} km away
          </li>
          <li>
            <Clock size={16} className="dev15-icon-muted" />
            {availability}
          </li>
        </ul>

        {/* Recommendation Reason */}
        <div className="dev15-matched-reason">
          <Lightbulb size={16} style={{ flexShrink: 0 }} />
          <p>{matchedReason}</p>
        </div>

        {/* Footer */}
        <div className="dev15-card-footer">
          <div className="dev15-price">
            <span className="dev15-price-label">Starting from</span>
            <strong>LKR {startingPrice.toLocaleString()}</strong>
          </div>

          <div className="dev15-actions">
            <button
              type="button"
              className="dev15-btn-secondary"
              onClick={() => onShowProfile?.(provider)}
            >
              Profile
            </button>
            <button
              type="button"
              className="dev15-btn-primary"
              onClick={() => onBookNow?.(provider)}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}