import React, { useState } from "react";
import { AlertTriangle, CalendarOff, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import IconButton from "../../components/common/IconButton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import useBlockedDates from "../../hooks/useBlockedDates";
import AddEditBlockedDateModal from "./AddEditBlockedDateModal";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function formatRange(startDate, endDate) {
  if (!endDate || endDate === startDate) return formatDate(startDate);
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export default function BlockedDatesTab() {
  const {
    blockedDates,
    loading,
    mutating,
    error,
    refresh,
    create,
    update,
    remove,
  } = useBlockedDates();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 409 conflicts are surfaced by the add/edit modal itself; the page-level
  // error UI is for load/refresh failures and non-conflict API errors.
  const showError =
    error && error.status !== 409 && !modalOpen && !deleteTarget;
  const loadFailed = showError && blockedDates.length === 0;

  const sortedDates = [...blockedDates].sort(
    (a, b) =>
      (a.startDate || "").localeCompare(b.startDate || "") ||
      (a.endDate || "").localeCompare(b.endDate || "")
  );

  function openAdd() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
  }

  async function handleSave(payload) {
    if (editingItem) {
      await update(editingItem.id, payload);
    } else {
      await create(payload);
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    try {
      await remove(deleteTarget.id);
    } catch {
      // hook stores the error; the error UI surfaces it
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "var(--cc-space-5)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--cc-space-4)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="cc-h1">Blocked Dates</h1>
          <p
            className="cc-body-sm cc-text-secondary"
            style={{ margin: "var(--cc-space-1) 0 0" }}
          >
            Block dates when you are away or unavailable so customers
            cannot book.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>
          Block Date
        </Button>
      </header>

      {showError && blockedDates.length > 0 && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--cc-space-3)",
            flexWrap: "wrap",
            padding: "var(--cc-space-3) var(--cc-space-4)",
            borderRadius: "var(--cc-radius-lg)",
            background: "var(--cc-error-soft)",
            color: "var(--cc-error-text)",
            fontSize: "var(--cc-text-body-sm-size)",
          }}
        >
          <AlertTriangle size={16} aria-hidden="true" style={{ flex: "none" }} />
          <span style={{ flex: "1", minWidth: "10rem" }}>
            {error.message || "Something went wrong."}
          </span>
          <Button variant="outline" size="sm" onClick={refresh}>
            Refresh
          </Button>
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "grid",
            placeItems: "center",
            padding: "var(--cc-space-10)",
          }}
        >
          <Spinner size="lg" label="Loading blocked dates" />
        </div>
      ) : loadFailed ? (
        <div
          role="alert"
          style={{
            display: "grid",
            justifyItems: "center",
            gap: "var(--cc-space-3)",
            textAlign: "center",
            padding: "var(--cc-space-8)",
            borderRadius: "var(--cc-radius-xl)",
            background: "var(--cc-error-soft)",
            color: "var(--cc-error-text)",
          }}
        >
          <AlertTriangle size={24} aria-hidden="true" />
          <strong>Something went wrong</strong>
          <p style={{ margin: 0 }}>
            {error.message || "Something went wrong."}
          </p>
          <Button variant="outline" size="sm" onClick={refresh}>
            Try Again
          </Button>
        </div>
      ) : blockedDates.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<CalendarOff size={20} />}
            title="No blocked dates"
            description="Block dates when you are away or unavailable so customers cannot book."
            action={
              <Button
                variant="secondary"
                leftIcon={<Plus size={16} />}
                onClick={openAdd}
              >
                Block Date
              </Button>
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          {sortedDates.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "var(--cc-space-4)",
                flexWrap: "wrap",
                padding: "var(--cc-space-4) var(--cc-space-5)",
                borderBottom:
                  index === sortedDates.length - 1
                    ? "none"
                    : "1px solid var(--cc-border-soft)",
              }}
            >
              <div
                style={{
                  flex: "1 1 14rem",
                  display: "grid",
                  gap: "var(--cc-space-1)",
                  minWidth: "10rem",
                }}
              >
                <strong
                  className="cc-body"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatRange(item.startDate, item.endDate)}
                </strong>
                <span className="cc-body-sm">{item.reason}</span>
                {item.note && (
                  <span
                    className="cc-body-sm cc-text-muted"
                    title={item.note}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.note}
                  </span>
                )}
              </div>

              <span
                style={{ display: "inline-flex", gap: "var(--cc-space-1)" }}
              >
                <IconButton
                  icon={<Pencil size={16} />}
                  label={`Edit blocked dates ${formatRange(item.startDate, item.endDate)}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(item)}
                />
                <IconButton
                  icon={<Trash2 size={16} />}
                  label={`Delete blocked dates ${formatRange(item.startDate, item.endDate)}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(item)}
                />
              </span>
            </div>
          ))}
        </Card>
      )}

      <AddEditBlockedDateModal
        open={modalOpen}
        blockedDate={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        danger
        loading={mutating}
        title="Delete blocked dates"
        message={
          deleteTarget
            ? `Delete ${formatRange(deleteTarget.startDate, deleteTarget.endDate)} — "${deleteTarget.reason || "no reason"}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
