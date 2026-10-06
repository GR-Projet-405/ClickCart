import { useEffect, useMemo, useState } from "react";
import { Check, Clock, X } from "lucide-react";

import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

import { decideVerification } from "../../services/adminDashboardService";
import formatTimestamp from "./formatTimestamp";
import styles from "./VerificationQueuePreview.module.css";

const STATUS_TONE = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

const initialOf = (name = "?") => String(name).trim().charAt(0).toUpperCase() || "?";

/**
 * Compact preview of the existing Provider Verification Queue.
 * Renders up to four recent/pending providers and calls the same
 * endpoints as pages/ProviderVerification/VerificationQueue.jsx.
 * The full management experience stays on /admin/providers.
 */
export default function VerificationQueuePreview({
  loading,
  source,
  data,
  error,
}) {
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [items, setItems] = useState(rows);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  // Re-sync whenever the hook refreshes (initial load, reload, fallback swap).
  useEffect(() => {
    setItems(rows);
    setNotice(null);
  }, [rows]);

  // Four rows max: pending requests first, then newest submission.
  const visible = useMemo(() => {
    const stampOf = (row) => {
      const value = Date.parse(row.submittedAt);
      return Number.isFinite(value) ? value : 0;
    };

    return items
      .map((row, index) => ({
        row,
        index,
        pending: row.status === "PENDING" ? 0 : 1,
        stamp: stampOf(row),
      }))
      .sort((a, b) => a.pending - b.pending || b.stamp - a.stamp || a.index - b.index)
      .slice(0, 4)
      .map(({ row }) => row);
  }, [items]);

  const pendingCount = useMemo(
    () => items.filter((row) => row.status === "PENDING").length,
    [items],
  );

  const isSample = source === "fallback";

  const runDecision = async (row, decision) => {
    setBusyId(row.id);
    try {
      await decideVerification(row.id, decision);
      setItems((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, status: decision === "approve" ? "APPROVED" : "REJECTED" }
            : item,
        ),
      );
      setNotice({
        tone: "success",
        text:
          decision === "approve"
            ? `${row.name} approved`
            : `${row.name} rejected`,
      });
    } catch {
      setNotice({
        tone: "error",
        text: "Could not update this provider. Check the backend and retry.",
      });
    } finally {
      setBusyId(null);
      setRejecting(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.state}>
        <Spinner label="Loading verification requests" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<Clock size={20} />}
        title="No verification requests"
        description="New provider submissions will appear here."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.summary}>
        <strong>{pendingCount}</strong> pending
        <span aria-hidden="true"> · </span>
        showing {visible.length} of {items.length}
      </p>

      <ul className={styles.list}>
        {visible.map((row) => {
          /* Fallback/sample rows are marked with `id: null` in
             config/adminDashboardData.js, so they are never actionable.
             The idle sentinel of `busyId` is also `null`, so the busy check
             must ignore rows without a real id — otherwise every sample row
             matched itself and rendered a permanent loading spinner. */
          const isSampleRow = row.id == null;
          const canAct = !isSampleRow && row.status === "PENDING";
          const busy = busyId != null && busyId === row.id;
          const disabledReason = isSampleRow
            ? "Sample row — actions are disabled while the verification service is unavailable."
            : canAct
              ? undefined
              : `Already ${row.status.toLowerCase()} — no further action needed.`;

          return (
            <li className={styles.row} key={row.id ?? row.name}>
              <Avatar
                src={row.avatar || undefined}
                alt={row.name}
                fallback={initialOf(row.name)}
                size="md"
              />

              <span className={styles.identity}>
                <span className={styles.name}>{row.name}</span>
                <span className={styles.meta}>
                  {row.category}
                  <span aria-hidden="true"> · </span>
                  {formatTimestamp(row.submittedAt)}
                </span>
              </span>

              <Badge variant={STATUS_TONE[row.status] || "neutral"}>
                {row.status}
              </Badge>

              <span className={styles.actions}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<X size={14} />}
                  disabled={!canAct || Boolean(busyId)}
                  title={disabledReason}
                  onClick={() => setRejecting(row)}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  size="sm"
                  leftIcon={<Check size={14} />}
                  loading={busy}
                  disabled={!canAct || Boolean(busyId)}
                  title={disabledReason}
                  onClick={() => runDecision(row, "approve")}
                >
                  Approve
                </Button>
              </span>
            </li>
          );
        })}
      </ul>

      {notice ? (
        <p
          className={`${styles.notice} ${
            notice.tone === "error" ? styles.noticeError : styles.noticeSuccess
          }`}
          role="status"
        >
          {notice.text}
        </p>
      ) : null}

      {isSample && !notice ? (
        <p className={styles.footnote} role="status">
          Showing sample rows — the verification service is unavailable
          {error ? ` (${error})` : ""}.
        </p>
      ) : null}

      <ConfirmDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        onConfirm={() => runDecision(rejecting, "reject")}
        title="Reject verification request"
        message={`${rejecting?.name ?? "This provider"} will be marked as rejected. Add detailed reasons from the full verification queue.`}
        confirmLabel="Reject provider"
        cancelLabel="Cancel"
        danger
        loading={Boolean(busyId)}
      />
    </div>
  );
}
