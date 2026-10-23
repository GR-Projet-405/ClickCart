import { notify } from "../../../context/FeedbackHost";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Percent,
  Wallet,
  Clock,
  Download,
  ChevronDown,
  X,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { providerEarningsService } from "../../../services/providerEarningsService";
import "./earnings.css";

export default function EarningsDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(null);

  // Form States
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportType, setExportType] = useState("summary");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, trendRes, catRes, jobsRes] = await Promise.all([
          providerEarningsService.getSummary(),
          providerEarningsService.getTrends(),
          providerEarningsService.getCategoryBreakdown(),
          providerEarningsService.getTransactions({ size: 4 })
        ]);
        setSummary(sumRes);
        setTrends(trendRes);
        setCategories(catRes);
        setRecentJobs(jobsRes.content || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPayout(true);
    try {
      const res = await providerEarningsService.requestPayout(undefined, {
        amount: parseFloat(payoutAmount),
        bankName: bankAccount.trim(),
        accountNumber: accountNumber.trim()
      });
      setPayoutSuccess(res);
      setSummary(await providerEarningsService.getSummary());
    } catch (err) {
      notify("Error: " + err.message);
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleExportDownload = () => {
    const rows = [["Metric", "LKR"], ["Gross revenue", summary?.totalGrossRevenue ?? 0], ["Commission", summary?.totalCommissionDeducted ?? 0], ["Available", summary?.netAvailableBalance ?? 0], ["Pending", summary?.pendingClearance ?? 0]];
    const url = URL.createObjectURL(new Blob([rows.map(row => row.join(",")).join(String.fromCharCode(10))], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "my-earnings-summary.csv"; link.click(); URL.revokeObjectURL(url);
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `LKR ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) return <div className="earnings-page" role="status">Loading your earnings…</div>;
  if (error) return <div className="earnings-page"><div role="alert" className="provider-data-error">{error}<button onClick={() => window.location.reload()}>Try again</button></div></div>;

  return (
    <div className="earnings-page">
      {/* Top Header */}
      <div className="earnings-header">
        <div className="earnings-header-info">
          <h1>Earnings & Financial Overview</h1>
          <p>Track your gross revenue, platform commission deductions, and net payouts</p>
        </div>
        <div className="earnings-header-actions">
          <div className="earnings-date-select">
            <span>Last 30 Days</span>
            <ChevronDown size={16} />
          </div>
          <button className="btn-export-report" onClick={handleExportDownload} disabled={!summary}>
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards Grid */}
      <div className="earnings-kpi-grid">
        {/* Total Gross Revenue */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-box icon-gross">
              <TrendingUp size={20} />
            </div>

          </div>
          <div className="kpi-title">Total Gross Revenue</div>
          <div className="kpi-value">{formatCurrency(summary?.totalGrossRevenue ?? 0)}</div>
          <div className="kpi-subtitle">Revenue for the selected period</div>
        </div>

        {/* Marketplace Commission */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-box icon-comm">
              <Percent size={20} />
            </div>
          </div>
          <div className="kpi-title">Marketplace Commission</div>
          <div className="kpi-value">{formatCurrency(summary?.totalCommissionDeducted ?? 0)}</div>
          <div className="kpi-subtitle">Actual commission deducted</div>
        </div>

        {/* Net Available Balance */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-box icon-net">
              <Wallet size={20} />
            </div>
          </div>
          <div className="kpi-title">Net Available Balance</div>
          <div className="kpi-value highlight-net">{formatCurrency(summary?.netAvailableBalance ?? 0)}</div>
          <button className="btn-request-payout" disabled={!summary || Number(summary.netAvailableBalance) < 1000} onClick={() => { setPayoutSuccess(null); setShowPayoutModal(true); }}>
            Request Payout
          </button>
        </div>

        {/* Pending Clearance */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-box icon-pending">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-title">Pending Clearance</div>
          <div className="kpi-value">{formatCurrency(summary?.pendingClearance ?? 0)}</div>
          <div className="kpi-subtitle">{summary?.activePendingBookingsCount ?? 0} active bookings in progress</div>
        </div>
      </div>

      <div className="earnings-charts-grid">
        <div className="chart-card">
          <div className="chart-card-header"><h3>Monthly Revenue & Net Earnings</h3></div>
          {trends.length ? <div className="provider-real-trends">{trends.map(item => {
            const maximum = Math.max(1, ...trends.map(row => Number(row.grossRevenue || 0)));
            return <div key={item.month} className="provider-trend-row"><strong>{item.month}</strong>
              <div><div className="provider-trend-track"><span style={{ width: `${Number(item.grossRevenue || 0) / maximum * 100}%` }} /></div>
              <small>Gross {formatCurrency(item.grossRevenue)} · Net {formatCurrency(item.netEarning)}</small></div></div>;
          })}</div> : <p className="provider-empty-data">Your earnings trend will appear after completed jobs.</p>}
        </div>
        <div className="chart-card">
          <div className="chart-card-header"><h3>Revenue by Category</h3></div>
          {categories.length ? categories.map(item => <div key={item.category} className="provider-category-row">
            <span>{item.category}</span><strong>{formatCurrency(item.amount)}</strong><small>{Number(item.percentage || 0).toFixed(1)}%</small>
          </div>) : <p className="provider-empty-data">No category earnings yet.</p>}
        </div>
      </div>

      {/* Row 3: Recent Completed Jobs Table */}
      <div className="recent-transactions-card">
        <div className="recent-header">
          <h3>Recent Completed Jobs</h3>
          <Link to="/provider/earnings/transactions" className="view-all-link">
            View All Transactions →
          </Link>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Booking Ref</th>
                <th>Service Title</th>
                <th>Gross</th>
                <th>Commission</th>
                <th>Net Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!recentJobs.length && <tr><td colSpan={7}>No transactions yet. Earnings will appear here as your jobs are completed.</td></tr>}
              {recentJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.date}</td>
                  <td className="booking-ref-cell">{job.bookingRef}</td>
                  <td>{job.serviceTitle}</td>
                  <td>{formatCurrency(job.grossAmount)}</td>
                  <td className="commission-cell">-{formatCurrency(job.commissionAmount)}</td>
                  <td className="net-payout-cell">{formatCurrency(job.netAmount)}</td>
                  <td>
                    <span className="status-badge status-completed">{job.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Export Report */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Export Financial Report</h3>
                <p>Download your verified statement, commission logs, and payout history.</p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowExportModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Select Report Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    style={{
                      padding: "0.75rem",
                      border: exportType === "summary" ? "2px solid #10b926" : "1px solid var(--cc-border)",
                      background: exportType === "summary" ? "#f0fdf4" : "#ffffff",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                    onClick={() => setExportType("summary")}
                  >
                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--cc-text-primary)" }}>Earnings Summary</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cc-text-secondary)" }}>Gross, commission & net totals</div>
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "0.75rem",
                      border: exportType === "detailed" ? "2px solid #10b926" : "1px solid var(--cc-border)",
                      background: exportType === "detailed" ? "#f0fdf4" : "#ffffff",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                    onClick={() => setExportType("detailed")}
                  >
                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--cc-text-primary)" }}>Itemized Statement</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--cc-text-secondary)" }}>Per-booking itemized audit logs</div>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Format
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="fmt"
                      checked={exportFormat === "pdf"}
                      onChange={() => setExportFormat("pdf")}
                    />
                    <FileText size={16} color="#dc2626" />
                    PDF Document (.pdf)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="fmt"
                      checked={exportFormat === "csv"}
                      onChange={() => setExportFormat("csv")}
                    />
                    <FileSpreadsheet size={16} color="#10b926" />
                    Excel / CSV Spreadsheet (.csv)
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button className="btn-modal-confirm" onClick={handleExportDownload}>
                <Download size={16} />
                Download Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Request Payout */}
      {showPayoutModal && (
        <div className="modal-backdrop" onClick={() => setShowPayoutModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Request Payout</h3>
                <p>Transfer cleared net earnings to your verified bank account.</p>
              </div>
              <button className="btn-close-modal" onClick={() => setShowPayoutModal(false)}>
                <X size={18} />
              </button>
            </div>

            {payoutSuccess ? (
              <div className="modal-body" style={{ textAlign: "center", padding: "2rem" }}>
                <CheckCircle2 size={54} color="#10b926" style={{ margin: "0 auto 1rem auto" }} />
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "var(--cc-text-primary)" }}>Payout Request Received!</h4>
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.875rem", color: "var(--cc-text-secondary)" }}>
                  Your payout of <strong>{formatCurrency(payoutSuccess.amount)}</strong> is saved and awaiting finance review. Reference: <strong>{payoutSuccess.payoutId}</strong>.
                </p>
                <button className="btn-modal-confirm" style={{ margin: "0 auto" }} onClick={() => setShowPayoutModal(false)}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit}>
                <div className="modal-body">
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1rem", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "600", textTransform: "uppercase" }}>
                      Available for Withdrawal
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#15803d" }}>
                      {formatCurrency(summary?.netAvailableBalance ?? 0)}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                      Withdrawal Amount (LKR)
                    </label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      min="1000"
                      max={summary?.netAvailableBalance ?? 0}
                      step="0.01"
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        border: "1px solid var(--cc-border)",
                        borderRadius: "8px",
                        fontSize: "0.9375rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                      Transfer Destination
                    </label>
                    <div className="provider-bank-fields">
                      <label>Bank name<input aria-label="Bank name" value={bankAccount} onChange={e => setBankAccount(e.target.value)} required /></label>
                      <label>Account number<input aria-label="Account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required autoComplete="off" /></label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-modal-cancel" onClick={() => setShowPayoutModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-confirm" disabled={submittingPayout}>
                    {submittingPayout ? "Processing..." : "Confirm Payout"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
