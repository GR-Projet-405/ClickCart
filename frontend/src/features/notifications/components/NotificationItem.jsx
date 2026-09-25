import React from "react";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import "../components.css";

const EVENT_ICON = {
  "booking.created": CalendarClock,
  "booking.status_changed": CalendarClock,
  "booking.cancelled": XCircle,
  "quote.received": MessageCircle,
  "quote.accepted": CheckCircle2,
  "payment.received": CreditCard,
  "payment.refunded": CreditCard,
  "review.received": Star,
  "review.response_received": MessageCircle,
  "provider.verification_approved": ShieldCheck,
  "provider.verification_rejected": ShieldCheck,
  "dispute.opened": Bell,
  "dispute.resolved": CheckCircle2,
  "message.received": MessageCircle,
};

function formatTimeAgo(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}) {
  const Icon = EVENT_ICON[notification.eventType] || Bell;
  const isUnread = !notification.read;

  return (
    <article
      className={`cc-card cc-card--padding-md notification-item ${isUnread ? "notification-item--unread" : ""}`}
      aria-label={`Notification: ${notification.title}`}
    >
      <div className="notification-item__icon" aria-hidden="true">
        <Icon size={20} />
        {isUnread && <span className="notification-item__dot" aria-hidden="true" />}
      </div>
      <div className="notification-item__body">
        <div className="notification-item__head">
          <h4 className="notification-item__title cc-h4">{notification.title}</h4>
          <span className="notification-item__time cc-text-caption">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="notification-item__message cc-body-sm">
          {notification.message}
        </p>
        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
          <div className="notification-item__meta">
            {Object.entries(notification.metadata).map(([key, value]) => (
              <span key={key} className="notification-item__meta-pill">
                <strong>{key}:</strong> {String(value)}
              </span>
            ))}
          </div>
        )}
        <div className="notification-item__actions">
          {isUnread && (
            <button
              type="button"
              className="notification-item__action"
              onClick={() => onMarkRead(notification.id)}
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              Mark as read
            </button>
          )}
          <button
            type="button"
            className="notification-item__action notification-item__action--danger"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}