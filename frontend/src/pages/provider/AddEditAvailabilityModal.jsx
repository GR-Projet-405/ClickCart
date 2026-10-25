import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

export const DAY_OPTIONS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

function toInputTime(time) {
  return time ? time.slice(0, 5) : "";
}

function toApiTime(time) {
  return time ? `${time}:00` : "";
}

export default function AddEditAvailabilityModal({
  open,
  onClose,
  rule = null,
  onSubmit,
}) {
  const [form, setForm] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      dayOfWeek: rule?.dayOfWeek || "",
      startTime: toInputTime(rule?.startTime),
      endTime: toInputTime(rule?.endTime),
      active: rule ? Boolean(rule.active) : true,
    });
    setErrors({});
    setConflict(null);
    setSubmitError(null);
    setSubmitting(false);
  }, [open, rule]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function validate() {
    const errs = {};
    if (!form.dayOfWeek) errs.dayOfWeek = "Select a day of the week.";
    if (!form.startTime) errs.startTime = "Start time is required.";
    if (!form.endTime) errs.endTime = "End time is required.";
    if (
      form.startTime &&
      form.endTime &&
      form.startTime >= form.endTime
    ) {
      errs.endTime = "End time must be after start time.";
    }
    return errs;
  }

  async function submit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setConflict(null);
    setSubmitError(null);
    try {
      await onSubmit({
        dayOfWeek: form.dayOfWeek,
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
        active: form.active,
      });
    } catch (err) {
      if (err?.status === 409) {
        setConflict(err.message || "This time range overlaps an existing rule.");
      } else {
        setSubmitError(
          err?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  const conflictMessage = conflict || submitError;

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={rule ? "Edit Availability" : "Add Availability"}
      size="sm"
      footer={
        <div className="cc-confirm-dialog__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            loading={submitting}
            onClick={submit}
          >
            {rule ? "Save Changes" : "Add Availability"}
          </Button>
        </div>
      }
    >
      <form
        id="cc-availability-form"
        noValidate
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "var(--cc-space-4)",
          padding: "var(--cc-space-2) 0 var(--cc-space-4)",
        }}
      >
        {conflictMessage && (
          <div
            role="alert"
            style={{
              display: "flex",
              gap: "var(--cc-space-3)",
              alignItems: "flex-start",
              padding: "var(--cc-space-3) var(--cc-space-4)",
              borderRadius: "var(--cc-radius-lg)",
              border: `1px solid ${conflict ? "var(--cc-warning)" : "var(--cc-error)"}`,
              background: conflict ? "var(--cc-warning-soft)" : "var(--cc-error-soft)",
              color: conflict ? "var(--cc-warning-text)" : "var(--cc-error-text)",
              fontSize: "var(--cc-text-body-sm-size)",
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={18} aria-hidden="true" style={{ flex: "none", marginTop: "0.1em" }} />
            <div>
              <strong style={{ display: "block" }}>
                {conflict ? "Schedule conflict" : "Unable to save"}
              </strong>
              <span>{conflictMessage}</span>
              {conflict && (
                <span style={{ display: "block", marginTop: "0.25em" }}>
                  Adjust your times and try again, or cancel.
                </span>
              )}
            </div>
          </div>
        )}

        <Select
          label="Day of week"
          required
          error={errors.dayOfWeek}
          value={form.dayOfWeek}
          onChange={(e) => setField("dayOfWeek", e.target.value)}
        >
          <option value="">Select a day</option>
          {DAY_OPTIONS.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </Select>

        <Input
          label="Start time"
          type="time"
          required
          error={errors.startTime}
          value={form.startTime}
          onChange={(e) => setField("startTime", e.target.value)}
        />

        <Input
          label="End time"
          type="time"
          required
          error={errors.endTime}
          value={form.endTime}
          onChange={(e) => setField("endTime", e.target.value)}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--cc-space-2)",
            fontSize: "var(--cc-text-body-sm-size)",
            color: "var(--cc-text-secondary)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setField("active", e.target.checked)}
          />
          Active — customers can book during this time
        </label>
      </form>
    </Modal>
  );
}
