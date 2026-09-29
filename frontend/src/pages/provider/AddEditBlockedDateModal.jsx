import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";

function formatDateValue(value) {
  return value || "";
}

export default function AddEditBlockedDateModal({
  open,
  onClose,
  blockedDate = null,
  onSubmit,
}) {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      startDate: formatDateValue(blockedDate?.startDate),
      endDate: formatDateValue(blockedDate?.endDate),
      reason: blockedDate?.reason || "",
      note: blockedDate?.note || "",
    });
    setErrors({});
    setConflict(null);
    setSubmitError(null);
    setSubmitting(false);
  }, [open, blockedDate]);

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
    if (!form.startDate) errs.startDate = "Start date is required.";
    if (!form.endDate) errs.endDate = "End date is required.";
    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      errs.endDate = "End date must not be before start date.";
    }
    if (!form.reason.trim()) {
      errs.reason = "Reason is required.";
    } else if (form.reason.trim().length > 100) {
      errs.reason = "Reason must not exceed 100 characters.";
    }
    if (form.note.trim().length > 500) {
      errs.note = "Note must not exceed 500 characters.";
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
      const note = form.note.trim();
      await onSubmit({
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
        note: note ? note : null,
      });
    } catch (err) {
      if (err?.status === 409) {
        setConflict(err.message || "This date range overlaps an existing block.");
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

  const bannerMessage = conflict || submitError;

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={blockedDate ? "Edit Blocked Date" : "Add Blocked Date"}
      size="md"
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
            {blockedDate ? "Save Changes" : "Block Date"}
          </Button>
        </div>
      }
    >
      <form
        id="cc-blocked-date-form"
        noValidate
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "var(--cc-space-4)",
          padding: "var(--cc-space-2) 0 var(--cc-space-4)",
        }}
      >
        {bannerMessage && (
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
            <AlertTriangle
              size={18}
              aria-hidden="true"
              style={{ flex: "none", marginTop: "0.1em" }}
            />
            <div>
              <strong style={{ display: "block" }}>
                {conflict ? "Schedule conflict" : "Unable to save"}
              </strong>
              <span>{bannerMessage}</span>
              {conflict && (
                <span style={{ display: "block", marginTop: "0.25em" }}>
                  Adjust the dates and try again, or cancel.
                </span>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gap: "var(--cc-space-4)",
            gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
          }}
        >
          <Input
            label="Start date"
            type="date"
            required
            error={errors.startDate}
            value={form.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            required
            error={errors.endDate}
            value={form.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
          />
        </div>

        <Input
          label="Reason"
          required
          error={errors.reason}
          value={form.reason}
          placeholder="e.g. Vacation, holiday, personal day"
          onChange={(e) => setField("reason", e.target.value)}
        />

        <Textarea
          label="Note"
          helperText="Optional — anything else you want to remember."
          error={errors.note}
          value={form.note}
          placeholder="Optional details"
          onChange={(e) => setField("note", e.target.value)}
        />
      </form>
    </Modal>
  );
}
