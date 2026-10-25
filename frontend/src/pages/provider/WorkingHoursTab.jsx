import React, { useState } from "react";
import { AlertTriangle, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import IconButton from "../../components/common/IconButton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import useAvailability from "../../hooks/useAvailability";
import AddEditAvailabilityModal, {
  DAY_OPTIONS,
} from "./AddEditAvailabilityModal";

const DAY_ORDER = DAY_OPTIONS.map((d) => d.value);
const DAY_LABELS = Object.fromEntries(
  DAY_OPTIONS.map((d) => [d.value, d.label])
);

function toDisplayTime(time) {
  return time ? time.slice(0, 5) : "";
}

export default function WorkingHoursTab() {
  const {
    rules,
    loading,
    mutating,
    error,
    refresh,
    createRule,
    updateRule,
    deleteRule,
  } = useAvailability();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 409 conflicts are surfaced by the add/edit modal itself; the page-level
  // error UI is for load/refresh failures and non-conflict API errors.
  const showError =
    error && error.status !== 409 && !modalOpen && !deleteTarget;
  const loadFailed = showError && rules.length === 0;

  const groupedDays = DAY_ORDER.map((day) => ({
    day,
    label: DAY_LABELS[day],
    items: rules.filter((rule) => rule.dayOfWeek === day),
  }));

  function openAdd() {
    setEditingRule(null);
    setModalOpen(true);
  }

  function openEdit(rule) {
    setEditingRule(rule);
    setModalOpen(true);
  }

  async function handleSave(payload) {
    if (editingRule) {
      await updateRule(editingRule.id, payload);
    } else {
      await createRule(payload);
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteRule(deleteTarget.id);
    } catch {
      // hook stores the error; the error UI below surfaces it
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
          <h1 className="cc-h1">Working Hours</h1>
          <p
            className="cc-body-sm cc-text-secondary"
            style={{ margin: "var(--cc-space-1) 0 0" }}
          >
            Set the hours customers can book appointments with you.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>
          Add Availability
        </Button>
      </header>

      {showError && rules.length > 0 && (
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
          <Spinner size="lg" label="Loading working hours" />
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
      ) : rules.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<Clock size={20} />}
            title="No working hours yet"
            description="Add your availability for each day so customers know when they can book."
            action={
              <Button
                variant="secondary"
                leftIcon={<Plus size={16} />}
                onClick={openAdd}
              >
                Add Availability
              </Button>
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          {groupedDays.map((group, index) => (
            <div
              key={group.day}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "var(--cc-space-4)",
                flexWrap: "wrap",
                padding: "var(--cc-space-4) var(--cc-space-5)",
                borderBottom:
                  index === groupedDays.length - 1
                    ? "none"
                    : "1px solid var(--cc-border-soft)",
              }}
            >
              <strong
                className="cc-body"
                style={{ minWidth: "7rem", flex: "none" }}
              >
                {group.label}
              </strong>

              <div
                style={{
                  flex: "1",
                  display: "grid",
                  gap: "var(--cc-space-2)",
                  minWidth: "12rem",
                }}
              >
                {group.items.length === 0 ? (
                  <span className="cc-body-sm cc-text-muted">Not set</span>
                ) : (
                  group.items.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--cc-space-3)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        className="cc-body-sm"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {toDisplayTime(rule.startTime)} –{" "}
                        {toDisplayTime(rule.endTime)}
                      </span>
                      <Badge variant={rule.active ? "success" : "neutral"}>
                        {rule.active ? "Active" : "Inactive"}
                      </Badge>
                      <span style={{ display: "inline-flex", gap: "var(--cc-space-1)" }}>
                        <IconButton
                          icon={<Pencil size={16} />}
                          label={`Edit ${group.label} ${toDisplayTime(rule.startTime)} to ${toDisplayTime(rule.endTime)}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(rule)}
                        />
                        <IconButton
                          icon={<Trash2 size={16} />}
                          label={`Delete ${group.label} ${toDisplayTime(rule.startTime)} to ${toDisplayTime(rule.endTime)}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(rule)}
                        />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <AddEditAvailabilityModal
        open={modalOpen}
        rule={editingRule}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        danger
        loading={mutating}
        title="Delete availability"
        message={
          deleteTarget
            ? `Delete ${DAY_LABELS[deleteTarget.dayOfWeek] || deleteTarget.dayOfWeek} ${toDisplayTime(deleteTarget.startTime)} – ${toDisplayTime(deleteTarget.endTime)}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
