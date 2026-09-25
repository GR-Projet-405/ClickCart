import React, { useEffect, useState } from "react";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import PageContainer from "../../components/common/PageContainer";
import NotificationItem from "../components/NotificationItem";
import {
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllAsRead,
  markNotificationRead,
} from "../notificationService";
import "./notifications.css";

import { Bell, BellOff, RefreshCw } from "lucide-react";

/**
 * In-app notification center list view. Usable from Customer,
 * Service Provider, and Admin layouts — it renders only content; the shared
 * layout supplies the header/sidebar/footer.
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("unread"); // "all" | "unread" | "read"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const readParam = filter === "all" ? undefined : filter === "unread" ? false : true;
      const [listRes, countRes] = await Promise.all([
        listNotifications({ read: readParam, page: 0, size: 50 }),
        filter === "all" ? Promise.resolve({ unreadCount }) : getUnreadCount(),
      ]);
      setNotifications(listRes.content || []);
      setUnreadCount(countRes.unreadCount ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      setError(err.message || "Failed to mark as read");
    }
  }

  async function handleMarkAll() {
    setActionLoading(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || "Failed to mark all as read");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete notification");
    }
  }

  return (
    <PageContainer>
      <div className="notification-page">
        <div className="notification-page__toolbar">
          <div>
            <h1 className="cc-h2">Notifications</h1>
            <p className="cc-body-sm" style={{ margin: 0, color: "var(--cc-text-secondary)" }}>
              {unreadCount} unread
            </p>
          </div>
          <div className="notification-page__toolbar-actions" style={{ display: "flex", gap: "var(--cc-space-2)" }}>
            <button
              type="button"
              className="cc-button cc-button--ghost"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </button>
            <button
              type="button"
              className="cc-button cc-button--secondary"
              onClick={handleMarkAll}
              disabled={actionLoading || unreadCount === 0}
            >
              <BellOff size={16} aria-hidden="true" />
              Mark all as read
            </button>
          </div>
        </div>

        <div className="notification-page__tabs" role="tablist" aria-label="Notification filter">
          {[
            { key: "unread", label: "Unread" },
            { key: "all", label: "All" },
            { key: "read", label: "Read" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className="notification-page__tab"
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="notification-page__empty">
            <Spinner size="lg" label="Loading notifications" />
          </div>
        ) : error ? (
          <div className="notification-page__empty">
            <EmptyState
              icon={<Bell size={32} aria-hidden="true" />}
              title="Could not load notifications"
              description={error}
              action={
                <button type="button" className="cc-button cc-button--primary" onClick={load}>
                  Try again
                </button>
              }
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-page__empty">
            <EmptyState
              icon={<BellOff size={32} aria-hidden="true" />}
              title="No notifications"
              description={
                filter === "unread"
                  ? "You have no unread notifications."
                  : "You have no notifications yet."
              }
            />
          </div>
        ) : (
          <div className="notification-page__list">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}