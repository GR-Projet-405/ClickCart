import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Plus,
  Search,
  X,
  Wallet,
} from "lucide-react";
import { fetchSettlements, createSettlement } from "../../services/settlementService";
import "./settlement-tracking.css";

/* ─── constants ──────────────────────────────────────────────────────── */
const SL_BANKS = [
  "Bank of Ceylon",
  "People's Bank",
  "Commercial Bank of Ceylon",
  "Hatton National Bank",
  "Sampath Bank",
  "Nations Trust Bank",
  "DFCC Bank",
  "Seylan Bank",
];

const FINANCE_STATES_ALL = [
  "All Finance States",
  "Released",
  "Settled",
  "Authorized",
  "Captured",
  "On Hold",
  "Disputed",
];

const FINANCE_STATES_CREATE = [
  "Authorized",
  "Captured",
  "Settled",
  "Released",
  "On Hold",
  "Disputed",
];

const DATE_FILTERS = ["Today", "This Week", "This Month", "Last 3 Months", "All Time"];
const PAGE_SIZE    = 10;

const STATE_SLUGS = {
  Released:   "released",
  Settled:    "settled",
  Authorized: "authorized",
  Captured:   "captured",
  "On Hold":  "on-hold",
  Disputed:   "disputed",
};

/* ─── helpers ─────────────────────────────────────────────────────────── */
function fmt(amount) {
  return "LKR " + new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/* ─── sub-components ──────────────────────────────────────────────────── */
function StatCard({ label, amount, count, badgeClass }) {
  return (
    <div className="stl-stat" aria-label={label}>
      <div className="stl-stat__label-row">
        <span className="stl-stat__label">{label}</span>
        <span className={`stl-stat__badge ${badgeClass}`}>{count} txs</span>
      </div>
      <div className="stl-stat__amount">{fmt(amount)}</div>
    </div>
  );
}

function AuthStateCard({ label, count, dotClass, subLabel }) {
  return (
    <div className="stl-auth-state">
      <div className="stl-auth-state__label-row">
        <span className="stl-auth-state__label">{label}</span>
        <span className={`stl-auth-state__dot ${dotClass}`} aria-hidden="true" />
      </div>
      <div className="stl-auth-state__count">{count}</div>
      <div className="stl-auth-state__sub">{subLabel}</div>
    </div>
  );
}

function CycleStep({ label, status, time }) {
  return (
    <div className="stl-cycle-step">
      <span className={`stl-cycle-step__label stl-cycle-step__label--${status}`}>
        <span className={`stl-cycle-step__status-dot stl-cycle-step__status-dot--${status}`} aria-hidden="true" />
        {label}
      </span>
      <span className="stl-cycle-step__time">{time}</span>
    </div>
  );
}

function FinanceStateBadge({ state }) {
  const slug = STATE_SLUGS[state] ?? "settled";
  return <span className={`stl__state-badge stl__state-badge--${slug}`}>{state}</span>;
}

function Pagination({ current, total, pageSize, onChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const delta = 2;
  let start = Math.max(1, current - delta);
  let end   = Math.min(pageCount, current + delta);
  if (end - start < delta * 2) {
    if (start === 1) end = Math.min(pageCount, start + delta * 2);
    else             start = Math.max(1, end - delta * 2);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="stl__pagination" aria-label="Settlement pagination">
      <button id="stl-page-prev" className="stl__page-btn"
        disabled={current <= 1} onClick={() => onChange(current - 1)} aria-label="Previous page">
        <ChevronLeft size={14} /> Previous
      </button>

      {start > 1 && (
        <>
          <button id="stl-page-1" className="stl__page-btn" onClick={() => onChange(1)}>1</button>
          {start > 2 && <span style={{ padding: "0 4px", color: "var(--cc-text-muted)" }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} id={`stl-page-${p}`}
          className={`stl__page-btn ${p === current ? "stl__page-btn--active" : ""}`}
          onClick={() => onChange(p)} aria-current={p === current ? "page" : undefined}>
          {p}
        </button>
      ))}

      {end < pageCount && (
        <>
          {end < pageCount - 1 && <span style={{ padding: "0 4px", color: "var(--cc-text-muted)" }}>…</span>}
          <button id={`stl-page-${pageCount}`} className="stl__page-btn" onClick={() => onChange(pageCount)}>
            {pageCount}
          </button>
        </>
      )}

      <button id="stl-page-next" className="stl__page-btn"
        disabled={current >= pageCount} onClick={() => onChange(current + 1)} aria-label="Next page">
        Next <ChevronRight size={14} />
      </button>
    </nav>
  );
}

/* ─── Add Settlement Modal ─────────────────────────────────────────────── */
const EMPTY_FORM = {
  merchantRecipient: "",
  amount: "",
  captureDate: todayISO(),
  settlementDate: tomorrowISO(),
  payoutMethod: "",
  financeState: "Authorized",
};

function validate(f) {
  const errs = {};
  if (!f.merchantRecipient.trim())       errs.merchantRecipient = "Merchant name is required";
  if (!f.amount || isNaN(Number(f.amount)) || Number(f.amount) <= 0)
                                          errs.amount = "Enter a valid amount (> 0)";
  if (!f.captureDate)                    errs.captureDate = "Capture date is required";
  if (!f.settlementDate)                 errs.settlementDate = "Settlement date is required";
  if (f.settlementDate < f.captureDate)  errs.settlementDate = "Settlement date must be ≥ capture date";
  if (!f.payoutMethod)                   errs.payoutMethod = "Select a bank / payment method";
  if (!f.financeState)                   errs.financeState = "Select a finance state";
  return errs;
}

function AddSettlementModal({ onClose, onCreated }) {
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");

  // auto-calculated fee preview
  const gross  = parseFloat(form.amount) || 0;
  const fee    = +(gross * 0.02).toFixed(2);
  const net    = +(gross - fee).toFixed(2);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitErr("");
    try {
      const created = await createSettlement({
        merchantRecipient: form.merchantRecipient.trim(),
        amount: parseFloat(form.amount),
        captureDate: form.captureDate,
        settlementDate: form.settlementDate,
        payoutMethod: form.payoutMethod,
        financeState: form.financeState,
      });
      onCreated(created);
    } catch (err) {
      setSubmitErr(err.message || "Failed to create settlement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="stl-modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="stl-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="stl-modal">
        {/* Header */}
        <div className="stl-modal__header">
          <div className="stl-modal__header-left">
            <div className="stl-modal__icon" aria-hidden="true">
              <Wallet size={18} />
            </div>
            <div>
              <h2 id="stl-modal-title" className="stl-modal__title">Add New Settlement</h2>
              <p className="stl-modal__subtitle">Fee is automatically calculated at 2%</p>
            </div>
          </div>
          <button className="stl-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form id="stl-add-form" onSubmit={handleSubmit} noValidate>
          <div className="stl-modal__body">

            {/* Merchant */}
            <div className="stl-modal__field">
              <label className="stl-modal__label" htmlFor="stl-merchant">
                Merchant / Recipient <span aria-hidden="true">*</span>
              </label>
              <input
                id="stl-merchant"
                className={`stl-modal__input${errors.merchantRecipient ? " stl-modal__input--error" : ""}`}
                type="text"
                placeholder="e.g. Perera & Sons Trading Co."
                value={form.merchantRecipient}
                onChange={(e) => set("merchantRecipient", e.target.value)}
                autoFocus
              />
              {errors.merchantRecipient && (
                <span className="stl-modal__field-error">
                  <AlertTriangle size={12} />{errors.merchantRecipient}
                </span>
              )}
            </div>

            {/* Amount + state */}
            <div className="stl-modal__row">
              <div className="stl-modal__field">
                <label className="stl-modal__label" htmlFor="stl-amount">
                  Gross Amount (LKR) <span aria-hidden="true">*</span>
                </label>
                <input
                  id="stl-amount"
                  className={`stl-modal__input${errors.amount ? " stl-modal__input--error" : ""}`}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 250000"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
                {errors.amount && (
                  <span className="stl-modal__field-error">
                    <AlertTriangle size={12} />{errors.amount}
                  </span>
                )}
              </div>

              <div className="stl-modal__field">
                <label className="stl-modal__label" htmlFor="stl-state">
                  Finance State <span aria-hidden="true">*</span>
                </label>
                <select
                  id="stl-state"
                  className={`stl-modal__select${errors.financeState ? " stl-modal__select--error" : ""}`}
                  value={form.financeState}
                  onChange={(e) => set("financeState", e.target.value)}
                >
                  {FINANCE_STATES_CREATE.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.financeState && (
                  <span className="stl-modal__field-error">
                    <AlertTriangle size={12} />{errors.financeState}
                  </span>
                )}
              </div>
            </div>

            {/* Fee preview */}
            {gross > 0 && (
              <div className="stl-modal__fee-preview" role="status" aria-live="polite">
                <div className="stl-modal__fee-item">
                  <span className="stl-modal__fee-label">Gross Amount</span>
                  <span className="stl-modal__fee-value">{fmt(gross)}</span>
                </div>
                <div className="stl-modal__fee-item">
                  <span className="stl-modal__fee-label">Platform Fee (2%)</span>
                  <span className="stl-modal__fee-value">− {fmt(fee)}</span>
                </div>
                <div className="stl-modal__fee-item">
                  <span className="stl-modal__fee-label">Net Payout</span>
                  <span className="stl-modal__fee-value stl-modal__fee-value--net">{fmt(net)}</span>
                </div>
                <p className="stl-modal__fee-note">
                  Platform fee of 2% is automatically deducted from the gross amount.
                </p>
              </div>
            )}

            {/* Dates */}
            <div className="stl-modal__row">
              <div className="stl-modal__field">
                <label className="stl-modal__label" htmlFor="stl-capture-date">
                  Capture Date <span aria-hidden="true">*</span>
                </label>
                <input
                  id="stl-capture-date"
                  className={`stl-modal__input${errors.captureDate ? " stl-modal__input--error" : ""}`}
                  type="date"
                  value={form.captureDate}
                  onChange={(e) => set("captureDate", e.target.value)}
                />
                {errors.captureDate && (
                  <span className="stl-modal__field-error">
                    <AlertTriangle size={12} />{errors.captureDate}
                  </span>
                )}
              </div>

              <div className="stl-modal__field">
                <label className="stl-modal__label" htmlFor="stl-settlement-date">
                  Settlement Date <span aria-hidden="true">*</span>
                </label>
                <input
                  id="stl-settlement-date"
                  className={`stl-modal__input${errors.settlementDate ? " stl-modal__input--error" : ""}`}
                  type="date"
                  value={form.settlementDate}
                  min={form.captureDate}
                  onChange={(e) => set("settlementDate", e.target.value)}
                />
                {errors.settlementDate && (
                  <span className="stl-modal__field-error">
                    <AlertTriangle size={12} />{errors.settlementDate}
                  </span>
                )}
              </div>
            </div>

            {/* Payout method */}
            <div className="stl-modal__field">
              <label className="stl-modal__label" htmlFor="stl-method">
                Payout Method (Bank) <span aria-hidden="true">*</span>
              </label>
              <select
                id="stl-method"
                className={`stl-modal__select${errors.payoutMethod ? " stl-modal__select--error" : ""}`}
                value={form.payoutMethod}
                onChange={(e) => set("payoutMethod", e.target.value)}
              >
                <option value="">— Select bank —</option>
                {SL_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.payoutMethod && (
                <span className="stl-modal__field-error">
                  <AlertTriangle size={12} />{errors.payoutMethod}
                </span>
              )}
            </div>

            {/* Submit error */}
            {submitErr && (
              <div className="stl-modal__submit-error" role="alert">
                <AlertTriangle size={15} />{submitErr}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="stl-modal__footer">
            <button type="button" className="stl-modal__cancel-btn" onClick={onClose}
              disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="stl-modal__submit-btn" disabled={submitting}>
              {submitting ? (
                <><span className="stl-modal__spinner" aria-hidden="true" /> Saving…</>
              ) : (
                <><Plus size={15} /> Add Settlement</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Success Toast ────────────────────────────────────────────────────── */
function Toast({ id, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="stl-toast" role="status" aria-live="polite">
      <CheckCircle2 size={16} />
      Settlement {id} added successfully!
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */
export default function SettlementTrackingPage() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [debouncedQ,  setDebouncedQ]  = useState("");
  const [dateFilter,  setDateFilter]  = useState("Today");
  const [stateFilter, setStateFilter] = useState("All Finance States");
  const [showModal,   setShowModal]   = useState(false);
  const [toastId,     setToastId]     = useState(null);

  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedQ, dateFilter, stateFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetchSettlements({
        page,
        pageSize: PAGE_SIZE,
        search:      debouncedQ,
        dateFilter,
        stateFilter: stateFilter === "All Finance States" ? "" : stateFilter,
      });
      setData(resp);
    } catch (e) {
      setError("Failed to load settlement data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ, dateFilter, stateFilter]);

  useEffect(() => { load(); }, [load]);

  /* ── CSV export ── */
  function handleExport() {
    if (!data?.settlements?.length) return;
    const headers = ["Settlement ID","Merchant/Recipient","Amount (LKR)","Fee (LKR)","Net Amount (LKR)","Capture Date","Settlement Date","Payout Method","Finance State"];
    const rows = data.settlements.map((r) => [
      r.id, r.merchantRecipient, r.amount, r.fee, r.netAmount,
      r.captureDate, r.settlementDate, r.payoutMethod, r.financeState,
    ]);
    const csv  = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `settlements-page${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  /* ── After modal creates a record ── */
  function handleCreated(row) {
    setShowModal(false);
    setToastId(row.id);
    load(); // refresh table + stats
  }

  const total   = data?.total   ?? 0;
  const from    = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to      = Math.min(page * PAGE_SIZE, total);
  const summary = data?.summary ?? {};
  const auth    = data?.financeAuthStates ?? {};
  const cycle   = data?.cycleTracker ?? {};

  return (
    <main id="settlement-tracking-page" className="stl" aria-label="Settlement Tracking">

      {/* ── Page header ── */}
      <div className="stl__header">
        <div className="stl__header-copy">
          <h1>Settlement Tracking &amp; Authorized Finance States</h1>
          <p>Monitor settlement cycles, authorization states, and payout delivery across batches.</p>
        </div>
        <div className="stl__header-actions">
          <button id="stl-export-csv" className="stl__export-btn"
            onClick={handleExport} aria-label="Export settlements as CSV">
            <Download size={15} /> Export CSV
          </button>
          <button id="stl-add-settlement" className="stl__add-btn"
            onClick={() => setShowModal(true)} aria-label="Add new settlement">
            <Plus size={15} /> Add Settlement
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="stl__error" role="alert">
          <AlertTriangle size={16} />{error}
        </div>
      )}

      {/* ── Summary stat cards ── */}
      <div className="stl__stats" aria-label="Payout summary">
        <StatCard label="Total Settlements"  amount={summary.totalSettlementsAmount ?? 0}  count={summary.totalSettlementsCount ?? 0}  badgeClass="stl-stat__badge--total"    />
        <StatCard label="Pending Payouts"    amount={summary.pendingPayoutsAmount   ?? 0}  count={summary.pendingPayoutsCount   ?? 0}  badgeClass="stl-stat__badge--pending"  />
        <StatCard label="Completed Payouts"  amount={summary.completedPayoutsAmount ?? 0}  count={summary.completedPayoutsCount ?? 0}  badgeClass="stl-stat__badge--complete" />
        <StatCard label="Failed Payouts"     amount={summary.failedPayoutsAmount    ?? 0}  count={summary.failedPayoutsCount    ?? 0}  badgeClass="stl-stat__badge--failed"   />
      </div>

      {/* ── Finance Authorization States ── */}
      <section className="stl__auth-card" aria-label="Finance Authorization States">
        <div className="stl__auth-header">
          <div className="stl__auth-header-copy">
            <h2>Finance Authorization States</h2>
            <p>Monitor the current state of every settlement batch before payout release.</p>
          </div>
          <span className="stl__auth-tag">6 states</span>
        </div>
        <div className="stl__auth-states">
          <AuthStateCard label="Authorized" count={auth.authorized ?? 0} dotClass="stl-auth-state__dot--authorized" subLabel="Funds reserved"   />
          <AuthStateCard label="Captured"   count={auth.captured   ?? 0} dotClass="stl-auth-state__dot--captured"   subLabel="Funds captured"   />
          <AuthStateCard label="Settled"    count={auth.settled    ?? 0} dotClass="stl-auth-state__dot--settled"    subLabel="Batch settled"    />
          <AuthStateCard label="Released"   count={auth.released   ?? 0} dotClass="stl-auth-state__dot--released"   subLabel="Funds released"   />
          <AuthStateCard label="On Hold"    count={auth.onHold     ?? 0} dotClass="stl-auth-state__dot--on-hold"    subLabel="Manual review"    />
          <AuthStateCard label="Disputed"   count={auth.disputed   ?? 0} dotClass="stl-auth-state__dot--disputed"   subLabel="Needs resolution" />
        </div>
      </section>

      {/* ── Settlement Cycle Tracker ── */}
      <section className="stl__cycle-card" aria-label="Settlement Cycle Tracker">
        <div className="stl__cycle-header">
          <div className="stl__cycle-header-copy">
            <h2>Settlement Cycle Tracker</h2>
            <p>T+0 to T+3 payout timeline with current batch progress.</p>
          </div>
          {cycle.cycleFinishesIn && (
            <span className="stl__cycle-eta">
              <Clock size={12} style={{ display:"inline", verticalAlign:"middle", marginRight:4 }} />
              Cycle finishes in {cycle.cycleFinishesIn}
            </span>
          )}
        </div>
        <div className="stl__cycle-progress-wrap" role="progressbar"
          aria-valuenow={cycle.progressPercent ?? 75} aria-valuemin={0} aria-valuemax={100}>
          <div className="stl__cycle-progress-fill"
            style={{ width: `${cycle.progressPercent ?? 75}%` }} />
        </div>
        <div className="stl__cycle-steps">
          {(cycle.steps ?? []).map((step) => (
            <CycleStep key={step.label} label={step.label} status={step.status} time={step.time} />
          ))}
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="stl__filters" role="search" aria-label="Settlement filters">
        <div className="stl__search-wrap">
          <span className="stl__search-icon" aria-hidden="true"><Search size={15} /></span>
          <input id="stl-search" type="search" className="stl__search-input"
            placeholder="Search by Settlement ID, Merchant, or Method..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            aria-label="Search settlements" />
        </div>
        <div className="stl__date-select-wrap">
          <span className="stl__date-icon" aria-hidden="true"><Calendar size={14} /></span>
          <select id="stl-date-filter" className="stl__date-select"
            value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Date filter">
            {DATE_FILTERS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <select id="stl-state-filter" className="stl__filter-select"
          value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
          aria-label="Finance state filter">
          {FINANCE_STATES_ALL.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="stl__table-wrap">
        {loading ? (
          <div className="stl__loading" role="status" aria-live="polite">
            <span className="stl__spinner" aria-hidden="true" />
            Loading settlements…
          </div>
        ) : (
          <>
            <table className="stl__table" aria-label="Settlement records">
              <thead>
                <tr>
                  <th scope="col">Settlement ID</th>
                  <th scope="col">Merchant/Recipient</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Fee</th>
                  <th scope="col">Net Amount</th>
                  <th scope="col">Capture Date</th>
                  <th scope="col">Settlement Date</th>
                  <th scope="col">Payout Method</th>
                  <th scope="col">Finance State</th>
                </tr>
              </thead>
              <tbody>
                {data?.settlements?.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign:"center", padding:"3rem", color:"var(--cc-text-muted)" }}>
                      No settlements match your filters.
                    </td>
                  </tr>
                ) : (
                  data?.settlements?.map((row) => (
                    <tr key={row.id}>
                      <td className="stl__id-cell">{row.id}</td>
                      <td className="stl__merchant-cell">{row.merchantRecipient}</td>
                      <td className="stl__amount-cell">{fmt(row.amount)}</td>
                      <td className="stl__fee-cell">{fmt(row.fee)}</td>
                      <td className="stl__net-cell">{fmt(row.netAmount)}</td>
                      <td className="stl__date-cell">{row.captureDate}</td>
                      <td className="stl__date-cell">{row.settlementDate}</td>
                      <td className="stl__date-cell">{row.payoutMethod}</td>
                      <td><FinanceStateBadge state={row.financeState} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="stl__table-footer">
              <span className="stl__table-info">
                Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> results
              </span>
              <Pagination current={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* ── Add Settlement Modal ── */}
      {showModal && (
        <AddSettlementModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* ── Success Toast ── */}
      {toastId && (
        <Toast id={toastId} onDismiss={() => setToastId(null)} />
      )}
    </main>
  );
}
