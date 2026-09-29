import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, User, ShieldCheck, AlertCircle, Phone, Mail } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import Button from "../../../components/common/Button";

export default function BookingDetailsModal({ booking, onClose, onCancelBooking }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const {
    id,
    serviceTitle,
    serviceCategory,
    imageUrl,
    statusLabel,
    status,
    providerName,
    providerAvatar,
    providerRating,
    providerReviewCount,
    bookingDate,
    timeSlot,
    location,
    address,
    totalCost,
    currency = "LKR",
    notes,
    customerName,
    customerPhone,
  } = booking;

  const isUpcoming = status === "UPCOMING" || status === "CONFIRMED";

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    await onCancelBooking(id, cancelReason);
    setIsSubmitting(false);
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="booking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="booking-modal__header">
          <div>
            <div className="booking-modal__id-tag">Booking #{id}</div>
            <h2 className="booking-modal__title">{serviceTitle}</h2>
          </div>
          <button
            type="button"
            className="booking-modal__close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="booking-modal__body">
          {/* Main Visual & Status */}
          <div className="booking-modal__hero">
            <img src={imageUrl} alt={serviceTitle} className="booking-modal__hero-img" />
            <div className="booking-modal__hero-info">
              <span className={`booking-card__badge booking-card__badge--${status?.toLowerCase()}`}>
                {statusLabel || "Confirmed"}
              </span>
              <span className="booking-modal__category">{serviceCategory || "Home Service"}</span>
            </div>
          </div>

          {/* Cancellation Warning Form if triggering cancel */}
          {showCancelConfirm ? (
            <div className="booking-modal__cancel-box">
              <div className="booking-modal__cancel-title">
                <AlertCircle size={18} className="booking-modal__alert-icon" />
                Cancel Booking Confirmation
              </div>
              <p className="booking-modal__cancel-text">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="booking-modal__reason-field">
                <label htmlFor="cancel-reason">Reason for cancellation (optional):</label>
                <textarea
                  id="cancel-reason"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, changed my mind..."
                />
              </div>
              <div className="booking-modal__cancel-actions">
                <Button
                  variant="ghost"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isSubmitting}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmCancel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Service Provider Details */}
              <div className="booking-modal__section">
                <h4 className="booking-modal__section-title">Assigned Service Provider</h4>
                <div className="booking-modal__provider-card">
                  <Avatar src={providerAvatar} fallback={providerName?.[0] || "P"} size="md" />
                  <div className="booking-modal__provider-details">
                    <span className="booking-modal__provider-name">{providerName}</span>
                    <span className="booking-modal__provider-rating">
                      ⭐ {providerRating || 5.0} ({providerReviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className="booking-modal__provider-badges">
                    <span className="booking-modal__verified-badge">
                      <ShieldCheck size={14} /> Verified Pro
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="booking-modal__section">
                <h4 className="booking-modal__section-title">Date, Time & Location</h4>
                <div className="booking-modal__grid">
                  <div className="booking-modal__grid-item">
                    <Calendar size={18} className="booking-modal__grid-icon" />
                    <div>
                      <span className="booking-modal__grid-label">Date</span>
                      <span className="booking-modal__grid-value">{bookingDate}</span>
                    </div>
                  </div>
                  <div className="booking-modal__grid-item">
                    <Clock size={18} className="booking-modal__grid-icon" />
                    <div>
                      <span className="booking-modal__grid-label">Time Slot</span>
                      <span className="booking-modal__grid-value">{timeSlot}</span>
                    </div>
                  </div>
                  <div className="booking-modal__grid-item booking-modal__grid-item--full">
                    <MapPin size={18} className="booking-modal__grid-icon" />
                    <div>
                      <span className="booking-modal__grid-label">Service Address</span>
                      <span className="booking-modal__grid-value">
                        {address || `${location}, Sri Lanka`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="booking-modal__section">
                  <h4 className="booking-modal__section-title">Special Instructions / Notes</h4>
                  <p className="booking-modal__notes-text">{notes}</p>
                </div>
              )}

              {/* Payment & Price Summary */}
              <div className="booking-modal__section">
                <h4 className="booking-modal__section-title">Cost Summary</h4>
                <div className="booking-modal__cost-summary">
                  <div className="booking-modal__cost-row">
                    <span>Base Service Fee</span>
                    <span>{currency} {(totalCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="booking-modal__cost-row">
                    <span>Platform Booking Charge</span>
                    <span className="booking-modal__free-tag">Free</span>
                  </div>
                  <div className="booking-modal__cost-row booking-modal__cost-row--total">
                    <span>Total Cost</span>
                    <span>{currency} {(totalCost || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!showCancelConfirm && (
          <div className="booking-modal__footer">
            {isUpcoming && (
              <Button
                variant="ghost"
                className="booking-modal__cancel-btn"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Booking
              </Button>
            )}
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
