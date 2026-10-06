import { useMemo } from "react";
import { CreditCard, ShieldAlert, Star, Undo2, Wrench } from "lucide-react";

import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

import { disputesPreviewData } from "../../config/adminDashboardData";
import formatTimestamp from "./formatTimestamp";
import styles from "./DisputesPreview.module.css";

/**
 * Phase 4.2 — Disputes & Support Cases preview.
 *
 * There is no admin disputes/support API yet, so the panel renders the
 * sample dataset from config/adminDashboardData.js. It performs no network
 * calls. To connect a real endpoint later, pass the fetched array as
 * `data` — only these field names are read:
 *   id, subject, category, priority, status, updatedAt
 *
 * Missing fields degrade to neutral copy instead of crashing.
 */

const CATEGORY_ICONS = {
  Refund: Undo2,
  "Service Issue": Wrench,
  Payment: CreditCard,
  "Service Quality": Star,
};

const STATUS_TONE = {
  open: "error",
  "under review": "info",
  resolved: "success",
};

const PRIORITY_TONE = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

const SUMMARY = [
  { id: "open", label: "Open", status: "open" },
  { id: "underReview", label: "Under review", status: "under review" },
  { id: "resolved", label: "Resolved", status: "resolved" },
];

const key = (value) => String(value ?? "").trim().toLowerCase();

export default function DisputesPreview({ data = disputesPreviewData }) {
  const cases = useMemo(
    () => (Array.isArray(data) ? data.filter(Boolean) : []),
    [data],
  );

  const counts = useMemo(() => {
    const totals = { open: 0, underReview: 0, resolved: 0 };
    cases.forEach((entry) => {
      const status = key(entry.status);
      if (status === "open") totals.open += 1;
      else if (status === "under review") totals.underReview += 1;
      else if (status === "resolved") totals.resolved += 1;
    });
    return totals;
  }, [cases]);

  if (!cases.length) {
    return (
      <EmptyState
        icon={<ShieldAlert size={20} />}
        title="No support cases"
        description="Disputes and customer support cases will appear here."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <ul className={styles.summary} aria-label="Case status summary">
        {SUMMARY.map((item) => (
          <li className={styles.stat} key={item.id}>
            <strong className={styles.statValue}>{counts[item.id]}</strong>
            <span className={styles.statLabel}>{item.label}</span>
          </li>
        ))}
      </ul>

      <ul className={styles.list}>
        {cases.map((entry, index) => {
          const Icon = CATEGORY_ICONS[entry.category] || ShieldAlert;
          const status = entry.status || "Unknown";
          const priority = entry.priority || "Normal";

          return (
            <li className={styles.row} key={entry.id ?? `case-${index}`}>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={16} />
              </span>

              <span className={styles.identity}>
                <span className={styles.heading}>
                  {entry.id ? (
                    <span className={styles.code}>{entry.id}</span>
                  ) : null}
                  <span className={styles.title}>
                    {entry.subject || "Support case"}
                  </span>
                </span>
                <span className={styles.meta}>{entry.category || "General"}</span>
              </span>

              <span className={styles.aside}>
                <span className={styles.badges}>
                  <Badge variant={PRIORITY_TONE[key(entry.priority)] || "neutral"}>
                    {priority}
                  </Badge>
                  <Badge variant={STATUS_TONE[key(entry.status)] || "neutral"}>
                    {status}
                  </Badge>
                </span>
                <span className={styles.time}>
                  Updated {formatTimestamp(entry.updatedAt)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className={styles.footnote}>
        Sample data — no disputes API exists yet, so these cases are
        illustrative until an endpoint is connected.
      </p>
    </div>
  );
}
