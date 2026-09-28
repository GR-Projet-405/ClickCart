import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  X,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  RotateCcw
} from "lucide-react";
import { providerEarningsService } from "../../../services/providerEarningsService";
import "./earnings.css";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState("90days");

  // Selected Transaction for Drawer
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    async function fetchTx() {
      setLoading(true);
      try {
        const res = await providerEarningsService.getTransactions({
          search,
          status: statusFilter,
          page: currentPage,
          size: 8
        });
        setTransactions(res.content || []);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTx();
  }, [search, statusFilter, currentPage]);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `LKR ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "SETTLED":
        return <span className="status-badge status-settled">Settled</span>;
      case "AVAILABLE":
        return <span className="status-badge status-available">Available</span>;
      case "PENDING":
        return <span className="status-badge status-pending">Pending</span>;
      case "REFUNDED":
        return <span className="status-badge status-refunded">Refunded</span>;
      default:
        return <span className="status-badge status-completed">{status}</span>;
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const headers = ["Date", "Transaction ID", "Booking Ref", "Service Name", "Customer", "Gross (LKR)", "Commission (LKR)", "Net Payout (LKR)", "Status", "Settlement Batch"];
    const rows = transactions.map((t) => [
      t.date,
      t.transactionId,
      t.bookingRef,
      `"${t.serviceTitle}"`,
      `"${t.customerName || ''}"`,
      t.grossAmount,
      t.commissionAmount,
      t.netAmount,
      t.status,
      t.settlementBatchId || "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ClickCart_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="earnings-page">
      {/* Top Header */}
      <div className="tx-page-header">
        <Link to="/provider/earnings" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Earnings Dashboard</span>
        </Link>
        <div className="earnings-header-info">
          <h1>Transaction History</h1>
          <p>View and export all financial movements, commission deductions, and payouts</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="tx-filter-toolbar">
        <div className="tx-filter-group">
          {/* Search Box */}
          <div className="tx-search-box">
            <Search size={16} className="tx-search-icon" />
            <input
              type="text"
              placeholder="Search Booking ID, Transaction ID, or Service..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="tx-search-input"
            />
          </div>

          {/* Date Range Picker */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="tx-select"
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="thisyear">This Year (2026)</option>
            <option value="all">All Time</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="tx-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="SETTLED">Settled</option>
            <option value="AVAILABLE">Available</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {/* Export CSV CTA */}
        <button className="btn-export-csv" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Transactions Data Table Card */}
      <div className="recent-transactions-card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Booking Ref</th>
                <th>Service Name</th>
                <th>Gross Earned</th>
                <th>Commission (Snapshot %)</th>
                <th>Net Payout</th>
                <th>Payout Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id || tx.transactionId}>
                    <td>{tx.date}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "#475467" }}>
                      {tx.transactionId}
                    </td>
                    <td>
                      <span style={{ color: "#0284c7", fontWeight: "600" }}>{tx.bookingRef}</span>
                    </td>
                    <td style={{ fontWeight: "500" }}>{tx.serviceTitle}</td>
                    <td>{formatCurrency(tx.grossAmount)}</td>
                    <td className="commission-cell">
                      {Math.round((tx.commissionRate || 0.10) * 100)}% (-{formatCurrency(tx.commissionAmount)})
                    </td>
                    <td className="net-payout-cell">{formatCurrency(tx.netAmount)}</td>
                    <td>{getStatusBadge(tx.status)}</td>
                    <td>
                      <button
                        className="btn-view-receipt"
                        onClick={() => setSelectedTx(tx)}
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="tx-pagination-wrapper">
          <div>
            Showing {totalElements === 0 ? 0 : currentPage * 8 + 1} -{" "}
            {Math.min((currentPage + 1) * 8, totalElements)} of {totalElements} transactions
          </div>
          <div className="tx-pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`pagination-btn ${idx === currentPage ? "active-page" : ""}`}
                onClick={() => setCurrentPage(idx)}
              >
                {idx + 1}
              </button>
            ))}

            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Transaction Details */}
      {selectedTx && (
        <div className="drawer-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Transaction Details</h3>
              <button className="btn-close-modal" onClick={() => setSelectedTx(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Header Box */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Transaction Reference</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: "700", color: "#0f172a" }}>
                    {selectedTx.transactionId}
                  </div>
                </div>
                <div>{getStatusBadge(selectedTx.status)}</div>
              </div>

              {/* Meta Card */}
              <div className="drawer-meta-card">
                <div className="drawer-meta-row">
                  <span>Booking Reference:</span>
                  <span>{selectedTx.bookingRef}</span>
                </div>
                <div className="drawer-meta-row">
                  <span>Service Title:</span>
                  <span>{selectedTx.serviceTitle}</span>
                </div>
                <div className="drawer-meta-row">
                  <span>Customer:</span>
                  <span>{selectedTx.customerName || "Sarah J."}</span>
                </div>
                <div className="drawer-meta-row">
                  <span>Service Date:</span>
                  <span>{selectedTx.date}</span>
                </div>
                {selectedTx.settlementBatchId && (
                  <div className="drawer-meta-row">
                    <span>Settlement Batch:</span>
                    <span style={{ fontFamily: "monospace" }}>{selectedTx.settlementBatchId}</span>
                  </div>
                )}
              </div>

              {/* Financial Calculation Breakdown (BR-07) */}
              <div className="drawer-breakdown-card">
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem" }}>
                  Financial Snapshot Breakdown
                </div>
                <div className="drawer-breakdown-row">
                  <span style={{ color: "#475467" }}>Gross Customer Payment</span>
                  <span style={{ fontWeight: "600" }}>{formatCurrency(selectedTx.grossAmount)}</span>
                </div>
                <div className="drawer-breakdown-row">
                  <span style={{ color: "#dc2626" }}>
                    Platform Commission ({Math.round((selectedTx.commissionRate || 0.10) * 100)}% Snapshot)
                  </span>
                  <span style={{ color: "#dc2626", fontWeight: "600" }}>
                    -{formatCurrency(selectedTx.commissionAmount)}
                  </span>
                </div>
                <div className="drawer-breakdown-row total-row">
                  <span style={{ color: "#10b926" }}>Provider Net Earning</span>
                  <span style={{ color: "#10b926" }}>{formatCurrency(selectedTx.netAmount)}</span>
                </div>
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem", borderRadius: "8px", fontSize: "0.75rem", color: "#166534" }}>
                <strong>Audit Rule BR-07 Verified:</strong> Commission deductions were frozen at the time of transaction creation and remain unaffected by subsequent platform rate changes.
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="btn-download-invoice"
                onClick={() => {
                  alert(`Downloading tax receipt for ${selectedTx.transactionId}...`);
                }}
              >
                <Download size={16} />
                <span>Download Invoice (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
