import { useMemo } from "react";
import { Activity, Bell, Info, ShieldAlert, UserRoundCheck } from "lucide-react";

import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

import {
  adminNotificationData,
  systemStatusData,
} from "../../config/adminDashboardData";
import styles from "./SystemStatusPreview.module.css";

/**
 * Phase 6 — System Status & Notifications preview.
 *
 * There is no admin system-status API and no admin notification API yet, so
 * the panel renders the sample datasets from config/adminDashboardData.js and
 * performs no network calls. Both arrays can be replaced later without
 * touching the UI:
 *   systemStatus={[{ name, status, detail }]}
 *   notifications={[{ id, title, type, time }]}
 *
 * Missing fields degrade to neutral fallback copy instead of crashing, and
 * status is always communicated by text as well as colour.
 */

const STATUS_TONE = {
  operational: "success",
  operationalandhealthy: "success",
  healthy: "success",
  ok: "success",
  up: "success",
  degraded: "warning",
  monitoring: "warning",
  delayed: "warning",
  unavailable: "error",
  down: "error",
  outage: "error",
  failed: "error",
};

const TONE_BADGE = {
  success: "success",
  warning: "warning",
  error: "error",
  neutral: "neutral",
};

const TONE_DOT = {
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  error: styles.dotError,
  neutral: styles.dotNeutral,
};

const TYPE_ICONS = {
  verification: UserRoundCheck,
  dispute: ShieldAlert,
  system: Info,
};

const TYPE_LABELS = {
  verification: "Verification",
  dispute: "Dispute",
  system: "System",
};

const text = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const key = (value) => String(value ?? "").trim().toLowerCase();

/** Keeps valid service records; unknown names/statuses get fallback copy. */
function normaliseServices(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === "object")
    .map((item, index) => {
      const status = text(item.status) || "Unknown";
      return {
        id: `${text(item.name) || "service"}-${index}`,
        name: text(item.name) || "Unknown service",
        status,
        detail: text(item.detail) || "No status available",
        tone: STATUS_TONE[key(status)] || "neutral",
      };
    });
}

/** Keeps valid notification records; unknown types fall back to neutral copy. */
function normaliseNotifications(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === "object")
    .map((item, index) => {
      const type = key(item.type);
      return {
        id: item.id === undefined || item.id === null ? `notification-${index}` : String(item.id),
        title: text(item.title) || "Notification",
        type,
        typeLabel: TYPE_LABELS[type] || (text(item.type) ? text(item.type) : "Update"),
        time: text(item.time) || "Recently",
      };
    });
}

/** One sentence that also decides the overall indicator tone. */
function overallStatus(services) {
  if (!services.length) {
    return { text: "No status available", tone: "neutral" };
  }
  if (services.some((service) => service.tone === "error")) {
    return { text: "Some systems are unavailable", tone: "error" };
  }
  if (services.some((service) => service.tone === "warning")) {
    return { text: "Operational with minor issues", tone: "warning" };
  }
  if (services.every((service) => service.tone === "success")) {
    return { text: "All systems operational", tone: "success" };
  }
  return { text: "Status partially unknown", tone: "neutral" };
}

export default function SystemStatusPreview({
  systemStatus = systemStatusData,
  notifications = adminNotificationData,
}) {
  const services = useMemo(() => normaliseServices(systemStatus), [systemStatus]);
  const alerts = useMemo(() => normaliseNotifications(notifications), [notifications]);
  const summary = useMemo(() => overallStatus(services), [services]);

  if (!services.length && !alerts.length) {
    return (
      <EmptyState
        icon={<Activity size={20} />}
        title="No status available"
        description="System health and admin notifications will appear here."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <span className={styles.summaryStatus}>
          <span className={TONE_DOT[summary.tone] || TONE_DOT.neutral} aria-hidden="true" />
          <span className={styles.summaryText}>{summary.text}</span>
        </span>
        <Badge variant="neutral">Sample data</Badge>
      </div>

      {services.length ? (
        <ul className={styles.services} aria-label="System service status">
          {services.map((service) => (
            <li className={styles.service} key={service.id}>
              <span className={styles.serviceMain}>
                <span className={styles.serviceName}>{service.name}</span>
                <Badge variant={TONE_BADGE[service.tone] || "neutral"}>
                  {service.status}
                </Badge>
              </span>
              <p className={styles.serviceDetail}>{service.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <section className={styles.notifications} aria-label="Notifications">
        <h3 className={styles.subheading}>Notifications</h3>

        {alerts.length ? (
          <ul className={styles.notificationList}>
            {alerts.map((item, index) => {
              const Icon = TYPE_ICONS[item.type] || Bell;

              return (
                <li className={styles.notification} key={`${item.id}-${index}`}>
                  <span className={styles.notificationIcon} aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <div className={styles.notificationBody}>
                    <p className={styles.notificationTitle}>{item.title}</p>
                    <p className={styles.notificationMeta}>
                      <span className={styles.notificationType}>{item.typeLabel}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{item.time}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.muted}>No notifications</p>
        )}
      </section>
    </div>
  );
}
