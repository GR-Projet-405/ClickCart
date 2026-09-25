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

  // Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(null);

  // Form States
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportType, setExportType] = useState("summary");
  const [payoutAmount, setPayoutAmount] = useState("86250.00");
  const [bankAccount, setBankAccount] = useState("boc");
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
        console.error("Failed to load earnings data:", err);
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
      const res = await providerEarningsService.requestPayout("provider-101", {
        amount: parseFloat(payoutAmount),
        bankName: bankAccount === "boc" ? "Bank of Ceylon" : "Commercial Bank of Ceylon",
        accountNumber: bankAccount === "boc" ? "8821941203" : "1049281744"
      });
      setPayoutSuccess(res);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleExportDownload = () => {
    alert(`Exporting ${exportType.toUpperCase()} report in ${exportFormat.toUpperCase()} format... Download started!`);
    setShowExportModal(false);
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `LKR ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
          <button className="btn-export-report" onClick={() => setShowExportModal(true)}>
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
            <span className="kpi-badge badge-positive">+14.2%</span>
          </div>
          <div className="kpi-title">Total Gross Revenue</div>
          <div className="kpi-value">{formatCurrency(summary?.totalGrossRevenue || 284500)}</div>
          <div className="kpi-subtitle">vs last month revenue</div>
        </div>

        {/* Marketplace Commission */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-box icon-comm">
              <Percent size={20} />
            </div>
          </div>
          <div className="kpi-title">Marketplace Commission</div>
          <div className="kpi-value">{formatCurrency(summary?.totalCommissionDeducted || 28450)}</div>
          <div className="kpi-subtitle">Platform fee rate: 10% snapshot</div>
        </div>

        {/* Net Available Balance */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon-box icon-net">
              <Wallet size={20} />
            </div>
          </div>
          <div className="kpi-title">Net Available Balance</div>
          <div className="kpi-value highlight-net">{formatCurrency(summary?.netAvailableBalance || 86250)}</div>
          <button className="btn-request-payout" onClick={() => { setPayoutSuccess(null); setShowPayoutModal(true); }}>
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
          <div className="kpi-value">{formatCurrency(summary?.pendingClearance || 18500)}</div>
          <div className="kpi-subtitle">{summary?.activePendingBookingsCount || 2} active bookings in progress</div>
        </div>
      </div>

      {/* Row 2: Charts Section */}
      <div className="earnings-charts-grid">
        {/* Left: Monthly Revenue vs Commission SVG Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Monthly Revenue vs Commission</h3>
            <div className="chart-legends">
              <span className="legend-item">
                <span className="legend-dot dot-gross"></span>
                <span>Gross Revenue</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot dot-net"></span>
                <span>Net Earning</span>
              </span>
            </div>
          </div>
          <div style={{ height: "220px", width: "100%", position: "relative" }}>
            <svg viewBox="0 0 540 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b926" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b926" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="520" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="520" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="110" x2="520" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="150" x2="520" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="5" y="34" fontSize="10" fill="#94a3b8">LKR 250k</text>
              <text x="5" y="74" fontSize="10" fill="#94a3b8">LKR 200k</text>
              <text x="5" y="114" fontSize="10" fill="#94a3b8">LKR 150k</text>
              <text x="5" y="154" fontSize="10" fill="#94a3b8">LKR 50k</text>

              {/* Smooth Area & Path for Gross */}
              <path
                d="M 50 140 C 130 90, 200 130, 280 80 C 340 70, 420 90, 510 35 L 510 160 L 50 160 Z"
                fill="url(#grossGradient)"
              />
              <path
                d="M 50 140 C 130 90, 200 130, 280 80 C 340 70, 420 90, 510 35"
                fill="none"
                stroke="#10b926"
                strokeWidth="2.5"
              />

              {/* Smooth Path for Net Earning */}
              <path
                d="M 50 148 C 130 102, 200 138, 280 92 C 340 82, 420 100, 510 48"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 3"
              />

              {/* X Axis Labels */}
              <text x="50" y="175" fontSize="11" fill="#64748b" textAnchor="middle">Jan</text>
              <text x="142" y="175" fontSize="11" fill="#64748b" textAnchor="middle">Feb</text>
              <text x="234" y="175" fontSize="11" fill="#64748b" textAnchor="middle">Mar</text>
              <text x="326" y="175" fontSize="11" fill="#64748b" textAnchor="middle">Apr</text>
              <text x="418" y="175" fontSize="11" fill="#64748b" textAnchor="middle">May</text>
              <text x="510" y="175" fontSize="11" fill="#64748b" textAnchor="middle">Jun</text>
            </svg>
          </div>
        </div>

        {/* Right: Category Donut Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Earnings by Service Category</h3>
          </div>
          <div className="donut-container">
            <svg width="130" height="130" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
              {/* Plumbing 45% */}
              <circle
                cx="21" cy="21" r="15.91549430918954" fill="transparent"
                stroke="#10b926" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="25"
              />
              {/* Electrical 25% */}
              <circle
                cx="21" cy="21" r="15.91549430918954" fill="transparent"
                stroke="#0284c7" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="80"
              />
              {/* Painting 20% */}
              <circle
                cx="21" cy="21" r="15.91549430918954" fill="transparent"
                stroke="#f59e0b" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="55"
              />
              {/* Other 10% */}
              <circle
                cx="21" cy="21" r="15.91549430918954" fill="transparent"
                stroke="#94a3b8" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="35"
              />
            </svg>

            <div className="donut-legend-list">
              <div className="donut-legend-row">
                <span className="donut-legend-info">
                  <span className="legend-dot" style={{ background: "#10b926" }}></span>
                  <span>Plumbing</span>
                </span>
                <strong>45%</strong>
              </div>
              <div className="donut-legend-row">
                <span className="donut-legend-info">
                  <span className="legend-dot" style={{ background: "#0284c7" }}></span>
                  <span>Electrical</span>
                </span>
                <strong>25%</strong>
              </div>
              <div className="donut-legend-row">
                <span className="donut-legend-info">
                  <span className="legend-dot" style={{ background: "#f59e0b" }}></span>
                  <span>Painting</span>
                </span>
                <strong>20%</strong>
              </div>
              <div className="donut-legend-row">
                <span className="donut-legend-info">
                  <span className="legend-dot" style={{ background: "#94a3b8" }}></span>
                  <span>Maintenance</span>
                </span>
                <strong>10%</strong>
              </div>
            </div>
          </div>
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
              {recentJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.date}</td>
                  <td className="booking-ref-cell">{job.bookingRef}</td>
                  <td>{job.serviceTitle}</td>
                  <td>{formatCurrency(job.grossAmount)}</td>
                  <td className="commission-cell">-{formatCurrency(job.commissionAmount)}</td>
                  <td className="net-payout-cell">{formatCurrency(job.netAmount)}</td>
                  <td>
                    <span className="status-badge status-completed">COMPLETED</span>
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
                      border: exportType === "summary" ? "2px solid #10b926" : "1px solid #e2e8f0",
                      background: exportType === "summary" ? "#f0fdf4" : "#ffffff",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                    onClick={() => setExportType("summary")}
                  >
                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0f172a" }}>Earnings Summary</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Gross, commission & net totals</div>
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "0.75rem",
                      border: exportType === "detailed" ? "2px solid #10b926" : "1px solid #e2e8f0",
                      background: exportType === "detailed" ? "#f0fdf4" : "#ffffff",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                    onClick={() => setExportType("detailed")}
                  >
                    <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0f172a" }}>Itemized Statement</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Per-booking itemized audit logs</div>
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
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#0f172a" }}>Payout Request Received!</h4>
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.875rem", color: "#64748b" }}>
                  Your payout of <strong>{formatCurrency(payoutSuccess.amount)}</strong> is being processed. Reference: <strong>{payoutSuccess.payoutId}</strong>.
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
                      {formatCurrency(summary?.netAvailableBalance || 86250)}
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
                      step="100"
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.8rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.9375rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", marginBottom: "0.35rem" }}>
                      Transfer Destination
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="bank"
                          checked={bankAccount === "boc"}
                          onChange={() => setBankAccount("boc")}
                        />
                        <Building2 size={20} color="#10b926" />
                        <div>
                          <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>Bank of Ceylon (BOC)</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Acc: **** 1203 • Verified</div>
                        </div>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="bank"
                          checked={bankAccount === "comb"}
                          onChange={() => setBankAccount("comb")}
                        />
                        <Building2 size={20} color="#0284c7" />
                        <div>
                          <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>Commercial Bank of Ceylon</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Acc: **** 1744 • Verified</div>
                        </div>
                      </label>
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
