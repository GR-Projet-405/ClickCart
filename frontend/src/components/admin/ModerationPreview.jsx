import { useMemo } from "react";
import { FileText, Flag, MessageSquare, UserRound } from "lucide-react";

import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

import { moderationPreviewData } from "../../config/adminDashboardData";
import formatTimestamp from "./formatTimestamp";
import styles from "./ModerationPreview.module.css";

/**
 * Phase 4.1 — Reported Content & Moderation preview.
 *
 * There is no admin moderation API yet, so the panel renders the sample
 * dataset from config/adminDashboardData.js. It performs no network calls.
 * To connect a real endpoint later, pass the fetched array as `data` — only
 * these field names are read:
 *   id, content, type, reason, status, reportedAt
 *
 * Missing fields degrade to neutral copy instead of crashing.
 */

const TYPE_ICONS = {
  "Service Listing": FileText,
  Provider: UserRound,
  Review: MessageSquare,
};

const STATUS_TONE = {
  pending: "warning",
  "under review": "info",
  resolved: "success",
};

const SUMMARY = [
  { id: "pending", label: "Pending", status: "pending" },
  { id: "underReview", label: "Under review", status: "under review" },
  { id: "resolved", label: "Resolved", status: "resolved" },
];

const key = (value) => String(value ?? "").trim().toLowerCase();

export default function ModerationPreview({ data = moderationPreviewData }) {
  const reports = useMemo(
    () => (Array.isArray(data) ? data.filter(Boolean) : []),
    [data],
  );

  const counts = useMemo(() => {
    const totals = { pending: 0, underReview: 0, resolved: 0 };
    reports.forEach((report) => {
      const status = key(report.status);
      if (status === "pending") totals.pending += 1;
      else if (status === "under review") totals.underReview += 1;
      else if (status === "resolved") totals.resolved += 1;
    });
    return totals;
  }, [reports]);

  if (!reports.length) {
    return (
      <EmptyState
        icon={<Flag size={20} />}
        title="No reported content"
        description="Flagged listings, profiles, and reviews will appear here."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <ul className={styles.summary} aria-label="Report status summary">
        {SUMMARY.map((item) => (
          <li className={styles.stat} key={item.id}>
            <strong className={styles.statValue}>{counts[item.id]}</strong>
            <span className={styles.statLabel}>{item.label}</span>
          </li>
        ))}
      </ul>

      <ul className={styles.list}>
        {reports.map((report, index) => {
          const Icon = TYPE_ICONS[report.type] || Flag;
          const status = report.status || "Unknown";

          return (
            <li className={styles.row} key={report.id ?? `report-${index}`}>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={16} />
              </span>

              <span className={styles.identity}>
                <span className={styles.heading}>
                  {report.id ? (
                    <span className={styles.code}>{report.id}</span>
                  ) : null}
                  <span className={styles.title}>
                    {report.content || "Reported content"}
                  </span>
                </span>
                <span className={styles.meta}>
                  {report.type || "Content"}
                  <span aria-hidden="true"> · </span>
                  {report.reason || "No reason provided"}
                </span>
              </span>

              <span className={styles.aside}>
                <Badge variant={STATUS_TONE[key(report.status)] || "neutral"}>
                  {status}
                </Badge>
                <span className={styles.time}>
                  {formatTimestamp(report.reportedAt)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className={styles.footnote}>
        Sample data — no moderation API exists yet, so these reports are
        illustrative until an endpoint is connected.
      </p>
    </div>
  );
}
