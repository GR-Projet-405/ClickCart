import { useMemo } from "react";
import { History } from "lucide-react";

import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

import formatTimestamp from "./formatTimestamp";
import styles from "./RecentActionsPreview.module.css";

/**
 * Compact "Recent Admin Actions" preview.
 *
 * Uses the same GET /admin/commission/audit-logs payload as
 * components/commission/AuditLogTable.jsx, rendered as a short activity list
 * instead of the full audit table. AuditLogTable itself is not modified.
 */
export default function RecentActionsPreview({ loading, source, data, error }) {
  // The audit endpoint returns records unsorted, so recent-first ordering is
  // applied here when the entries carry real timestamps. Sample rows already
  // use relative labels ("12 minutes ago") and keep their authored order.
  const visible = useMemo(() => {
    const entries = Array.isArray(data) ? data : [];
    const stamps = entries.map((entry) => Date.parse(entry.timestamp));

    if (stamps.length && stamps.every(Number.isFinite)) {
      return entries
        .map((entry, index) => ({ entry, stamp: stamps[index] }))
        .sort((a, b) => b.stamp - a.stamp)
        .slice(0, 6)
        .map(({ entry }) => entry);
    }

    return entries.slice(0, 6);
  }, [data]);

  if (loading) {
    return (
      <div className={styles.state}>
        <Spinner label="Loading recent admin actions" />
      </div>
    );
  }

  if (!visible.length) {
    return (
      <EmptyState
        icon={<History size={20} />}
        title="No recent actions"
        description="Administrative changes will be listed here."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {visible.map((entry) => (
          <li className={styles.item} key={entry.id}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.body}>
              <span className={styles.action}>{entry.action}</span>
              <span className={styles.meta}>
                {entry.actor}
                <span aria-hidden="true"> · </span>
                {formatTimestamp(entry.timestamp)}
              </span>
            </span>
          </li>
        ))}
      </ul>


    </div>
  );
}
