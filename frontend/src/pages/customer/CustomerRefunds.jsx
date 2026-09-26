import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Clock,
  FileText,
  RefreshCw,
  Shield,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageContainer from "../../components/common/PageContainer";
import Select from "../../components/common/Select";
import Spinner from "../../components/common/Spinner";
import Textarea from "../../components/common/Textarea";
import {
  cancelRefund,
  getRefundsByCustomer,
  submitRefund,
} from "../../services/refundService";
import "./CustomerRefunds.css";

// constants 

const CUSTOMER_ID = "customer-001"; // TODO: replace with auth context

const REASONS = [
  "Service Not Completed",
  "Service Delayed",
  "Unsatisfactory Service",
  "Provider Did Not Show",
  "Wrong Service Delivered",
  "Duplicate Payment",
  "Other",
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    variant: "warning",
    icon: <Clock size={12} />,
  },
  APPROVED: {
    label: "Approved",
    variant: "success",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: "Rejected",
    variant: "error",
    icon: <XCircle size={12} />,
  },
  COMPLETED: {
    label: "Completed",
    variant: "info",
    icon: <CheckCircle2 size={12} />,
  },
};

const TIMELINE_STEPS = [
  { key: "submitted", label: "Request Submitted", sub: "Request logged in system" },
  { key: "review", label: "Under Review", sub: "In progress by ClickCart Finance" },
  { key: "decision", label: "Decision Made", sub: "Approved or Rejected notification" },
  { key: "processed", label: "Refund Processed", sub: "Funds returned to payment source" },
];

function timelineStepIndex(status) {
  switch (status) {
    case "PENDING": return 1; // submitted ✓, review active
    case "APPROVED": return 2; // submitted ✓, review ✓, decision active
    case "REJECTED": return 2;
    case "COMPLETED": return 3; // all done
    default: return 0;
  }
}

// helpers 

function formatLKR(amount) {
  return `LKR ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// sub-components 

function StatCard({ label, count, sub, variant }) {
  const variantClass = variant ? `refund-stat--${variant}` : "";
  const statusLabel =
    variant === "pending" ? "Status" :
      variant === "approved" ? "Status" :
        variant === "rejected" ? "Status" :
          variant === "completed" ? "Status" : "";

  const badgeVariant =
    variant === "pending" ? "warning" :
      variant === "approved" ? "success" :
        variant === "rejected" ? "error" :
          variant === "completed" ? "info" : "neutral";

  return (
    <div className={`refund-stat cc-card cc-card--default cc-card--padding-md ${variantClass}`}>
      <div className="refund-stat__header">
        <span className="refund-stat__label">{label}</span>
        {statusLabel && <Badge variant={badgeVariant}>{statusLabel}</Badge>}
      </div>
      <div className="refund-stat__count">{count}</div>
      <p className="refund-stat__sub">{sub}</p>
    </div>
  );
}

function StatusTimeline({ refund }) {
  if (!refund) return null;
  const activeIdx = timelineStepIndex(refund.status);
  const isRejected = refund.status === "REJECTED";

  return (
    <div className="refund-timeline__steps">
      {TIMELINE_STEPS.map((step, idx) => {
        const done = idx < activeIdx;
        const active = idx === activeIdx;
        const reject = isRejected && idx === 2;

        return (
          <div
            key={step.key}
            className={[
              "refund-timeline__step",
              done ? "refund-timeline__step--done" : "",
              active ? "refund-timeline__step--active" : "",
              reject ? "refund-timeline__step--reject" : "",
            ].join(" ")}
          >
            <div className="refund-timeline__dot">
              {done && <CheckCircle2 size={16} />}
              {active && !reject && <CircleDot size={16} />}
              {reject && <XCircle size={16} />}
              {!done && !active && <span className="refund-timeline__empty-dot" />}
            </div>
            <div className="refund-timeline__info">
              <span className="refund-timeline__step-label">{step.label}</span>
              <span className="refund-timeline__step-sub">
                {active && step.key === "review"
                  ? "In progress by ClickCart Finance"
                  : step.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EvidenceUploader({ files, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const MAX = 3;

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      onAdd(dropped);
    },
    [onAdd]
  );

  const handleChange = (e) => {
    onAdd(Array.from(e.target.files));
    e.target.value = "";
  };

  const canUpload = files.length < MAX;

  return (
    <div className="refund-uploader">
      {canUpload && (
        <div
          className="refund-uploader__zone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload evidence photos"
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <Upload size={32} className="refund-uploader__icon" />
          <span className="refund-uploader__cta">Click to upload photos</span>
          <span className="refund-uploader__hint">
            PNG, JPG format up to 5MB each
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="refund-uploader__input"
            onChange={handleChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}
      {files.length > 0 && (
        <ul className="refund-uploader__previews" aria-label="Uploaded photos">
          {files.map((file, idx) => (
            <li key={idx} className="refund-uploader__preview">
              <img
                src={URL.createObjectURL(file)}
                alt={`Evidence ${idx + 1}`}
                className="refund-uploader__thumb"
              />
              <button
                type="button"
                className="refund-uploader__remove"
                aria-label={`Remove photo ${idx + 1}`}
                onClick={() => onRemove(idx)}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// main page 

const EMPTY_FORM = {
  bookingId: "",
  serviceName: "",
  amount: "",
  reason: REASONS[0],
  description: "",
};

export default function CustomerRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [activeRefund, setActiveRefund] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // data loading 

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRefundsByCustomer(CUSTOMER_ID);
      setRefunds(data);
      // Keep active refund in sync
      if (activeRefund) {
        const fresh = data.find((r) => r.id === activeRefund.id);
        setActiveRefund(fresh ?? data[0] ?? null);
      } else {
        setActiveRefund(data[0] ?? null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeRefund]);

  useEffect(() => { loadRefunds(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  //  stats 

  const stats = {
    pending: refunds.filter((r) => r.status === "PENDING").length,
    approved: refunds.filter((r) => r.status === "APPROVED").length,
    rejected: refunds.filter((r) => r.status === "REJECTED").length,
    completed: refunds.filter((r) => r.status === "COMPLETED").length,
  };

  //  form handlers 

  const handleField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.bookingId.trim()) errs.bookingId = "Booking ID is required";
    if (!form.description.trim()) errs.description = "Please describe the issue";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // In a real app, upload images to storage first and get URLs back.
      const evidenceUrls = evidenceFiles.map((_, i) => `evidence-${i}`);

      await submitRefund({
        bookingId: form.bookingId,
        customerId: CUSTOMER_ID,
        serviceName: form.serviceName,
        amount: parseFloat(form.amount) || 0,
        reason: form.reason,
        description: form.description,
        evidenceUrls,
      });

      setSuccessMsg("Your refund request has been submitted successfully!");
      setForm(EMPTY_FORM);
      setEvidenceFiles([]);
      await loadRefunds();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = async (refund) => {
    if (!window.confirm(`Cancel refund ${refund.refundId}?`)) return;
    setCancellingId(refund.id);
    try {
      await cancelRefund(refund.id);
      if (activeRefund?.id === refund.id) setActiveRefund(null);
      await loadRefunds();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleAddFiles = (newFiles) => {
    setEvidenceFiles((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 3);
    });
  };

  const handleRemoveFile = (idx) =>
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx));

  // render

  return (
    <div className="customer-refunds" aria-labelledby="refunds-heading">
      <PageContainer>
        {/* page header */}
        <div className="customer-refunds__header">
          <div>
            <h1 id="refunds-heading" className="cc-h2">My Refunds</h1>
            <p className="cc-body-sm cc-text-secondary">
              Request refunds for incomplete, delayed, or unsatisfactory services.
            </p>
          </div>
          <button
            className="customer-refunds__refresh"
            type="button"
            aria-label="Refresh refunds"
            onClick={loadRefunds}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/*  stat cards  */}
        <div className="customer-refunds__stats" role="region" aria-label="Refund summary">
          <StatCard
            label="Pending Requests"
            count={stats.pending}
            sub="Awaiting review"
            variant="pending"
          />
          <StatCard
            label="Approved Refunds"
            count={stats.approved}
            sub="Returned to source"
            variant="approved"
          />
          <StatCard
            label="Rejected Requests"
            count={stats.rejected}
            sub="Denied with explanation"
            variant="rejected"
          />
          <StatCard
            label="Completed Refunds"
            count={stats.completed}
            sub="Successfully paid out"
            variant="completed"
          />
        </div>

        {/*  main content grid  */}
        <div className="customer-refunds__grid">

          {/*  left column  */}
          <div className="customer-refunds__left">

            {/*  global alerts  */}
            {error && (
              <div className="refund-alert refund-alert--error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button
                  type="button"
                  aria-label="Dismiss error"
                  onClick={() => setError(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {successMsg && (
              <div className="refund-alert refund-alert--success" role="status">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
                <button
                  type="button"
                  aria-label="Dismiss message"
                  onClick={() => setSuccessMsg(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/*  submit form  */}
            <Card className="refund-form-card">
              <h2 className="cc-h4 refund-form-card__title">
                Submit New Refund Request
              </h2>
              <form
                id="refund-form"
                className="refund-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="refund-form__row">
                  <Input
                    id="refund-booking-id"
                    label="Booking ID"
                    required
                    placeholder="BK-90481"
                    value={form.bookingId}
                    onChange={handleField("bookingId")}
                    error={formErrors.bookingId}
                    autoComplete="off"
                  />
                  <Select
                    id="refund-reason"
                    label="Reason for Refund"
                    required
                    value={form.reason}
                    onChange={handleField("reason")}
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>
                </div>

                <div className="refund-form__row">
                  <Input
                    id="refund-service-name"
                    label="Service Name"
                    placeholder="Plumbing Repair"
                    value={form.serviceName}
                    onChange={handleField("serviceName")}
                    autoComplete="off"
                  />
                  <Input
                    id="refund-amount"
                    label="Amount (LKR)"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="4500.00"
                    value={form.amount}
                    onChange={handleField("amount")}
                    autoComplete="off"
                  />
                </div>

                <Textarea
                  id="refund-description"
                  label="Detailed Description"
                  required
                  placeholder="Describe the issue in detail…"
                  value={form.description}
                  onChange={handleField("description")}
                  error={formErrors.description}
                />

                <div className="cc-field">
                  <span className="cc-field__label">Evidence / Photos (Max 3)</span>
                  <EvidenceUploader
                    files={evidenceFiles}
                    onAdd={handleAddFiles}
                    onRemove={handleRemoveFile}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="refund-form__submit"
                  loading={submitLoading}
                >
                  Submit Refund Request
                </Button>
              </form>
            </Card>

            {/*  history table  */}
            <Card className="refund-history-card">
              <h2 className="cc-h4 refund-history-card__title">
                <FileText size={18} />
                Refund History
              </h2>

              {loading ? (
                <div className="refund-history__loading">
                  <Spinner />
                  <span>Loading refunds…</span>
                </div>
              ) : refunds.length === 0 ? (
                <div className="refund-history__empty">
                  <FileText size={40} />
                  <p>No refund requests yet</p>
                  <span>Submit your first refund request above.</span>
                </div>
              ) : (
                <div className="refund-table-wrap">
                  <table className="refund-table" aria-label="Refund history">
                    <thead>
                      <tr>
                        <th>Refund ID</th>
                        <th>Booking ID</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Requested Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds.map((r) => {
                        const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                        const isCancelling = cancellingId === r.id;
                        return (
                          <tr
                            key={r.id}
                            className={activeRefund?.id === r.id ? "refund-table__row--active" : ""}
                          >
                            <td className="refund-table__refund-id">{r.refundId}</td>
                            <td>{r.bookingId}</td>
                            <td>{r.serviceName || "—"}</td>
                            <td className="refund-table__amount">
                              {formatLKR(r.amount)}
                            </td>
                            <td>
                              <Badge variant={cfg.variant}>
                                {cfg.label}
                              </Badge>
                            </td>
                            <td>{formatDate(r.requestedAt)}</td>
                            <td className="refund-table__actions">
                              <button
                                type="button"
                                className="refund-table__view-btn"
                                onClick={() => setActiveRefund(r)}
                                aria-label={`View refund ${r.refundId}`}
                              >
                                View
                              </button>
                              {r.status === "PENDING" && (
                                <button
                                  type="button"
                                  className="refund-table__cancel-btn"
                                  onClick={() => handleCancel(r)}
                                  disabled={isCancelling}
                                  aria-label={`Cancel refund ${r.refundId}`}
                                >
                                  {isCancelling ? <Spinner size="sm" /> : "Cancel"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/*  right column: status panel  */}
          <aside className="customer-refunds__right" aria-label="Current refund status">
            <Card className="refund-status-card">
              <h2 className="cc-h5 refund-status-card__title">
                Current Request Status
              </h2>

              {!activeRefund ? (
                <div className="refund-status-card__empty">
                  <CircleDot size={32} />
                  <p>Select a refund to see its status</p>
                </div>
              ) : (
                <>
                  <div className="refund-status-card__meta">
                    <span className="refund-status-card__case-label">ACTIVE CASE</span>
                    <strong className="refund-status-card__refund-id">
                      {activeRefund.refundId}
                    </strong>
                    <span className="refund-status-card__amount">
                      Amount: {formatLKR(activeRefund.amount)}
                    </span>
                  </div>

                  <StatusTimeline refund={activeRefund} />

                  {activeRefund.reason && (
                    <div className="refund-status-card__reason">
                      <span className="refund-status-card__reason-label">Reason</span>
                      <span>{activeRefund.reason}</span>
                    </div>
                  )}

                  {activeRefund.description && (
                    <div className="refund-status-card__desc">
                      <span className="refund-status-card__desc-label">Description</span>
                      <p>{activeRefund.description}</p>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* secure payments badge */}
            <Card className="refund-secure-card">
              <div className="refund-secure-card__inner">
                <Shield size={20} className="refund-secure-card__icon" />
                <div>
                  <strong>Secure Payments</strong>
                  <p>All transactions are encrypted and monitored 24/7 for your security.</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}
