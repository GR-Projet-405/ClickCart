import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Download, ArrowLeft, CheckCircle, Shield, Building, User, Calendar, Hash } from "lucide-react";
import Button from "../../components/common/Button";
import { paymentService } from "../../services/paymentService";
import "./ReceiptPage.css";

export default function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
      setLoading(true);
      try {
        const data = await paymentService.getReceipt(id || "REC-2026-981245");
        setReceipt(data);
      } catch (err) {
        console.error("Error loading receipt:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReceipt();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="cc-receipt-wrapper">
        <p>Loading digital receipt details...</p>
      </div>
    );
  }

  const formattedDate = receipt?.issueDate
    ? new Date(receipt.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString();

  return (
    <div className="cc-receipt-wrapper">
      <div className="cc-receipt-actions">
        <Button variant="outline" leftIcon={<ArrowLeft size={18} />} onClick={() => navigate("/customer/payments")}>
          Back to Payments
        </Button>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button leftIcon={<Printer size={18} />} onClick={handlePrint}>
            Print / Save Receipt
          </Button>
        </div>
      </div>

      <div className="cc-receipt-paper">
        {/* Top Header */}
        <div className="cc-receipt-top">
          <div className="cc-receipt-brand">
            <span className="cc-receipt-logo-text">ClickCart</span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>AI-Powered Local Services Marketplace</span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Tax Invoice / Payment Verification Receipt</span>
          </div>
          <div className="cc-receipt-badge-stamp">
            PAID & VERIFIED
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="cc-receipt-meta-grid">
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
              Receipt & Booking Info
            </div>
            <div style={{ fontSize: "14px", color: "#0f172a" }}><strong>Receipt No:</strong> {receipt?.receiptNumber}</div>
            <div style={{ fontSize: "14px", color: "#0f172a" }}><strong>Booking Ref:</strong> {receipt?.bookingId}</div>
            <div style={{ fontSize: "14px", color: "#0f172a" }}><strong>Transaction ID:</strong> {receipt?.transactionId}</div>
            <div style={{ fontSize: "14px", color: "#0f172a" }}><strong>Date Issued:</strong> {formattedDate}</div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
              Billed To Customer
            </div>
            <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: "600" }}>{receipt?.customerName}</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>{receipt?.customerEmail}</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>{receipt?.customerPhone}</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>{receipt?.serviceAddress}</div>
          </div>
        </div>

        {/* Provider Details */}
        <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <Building size={18} color="#0284c7" />
            <span><strong>Service Provider:</strong> {receipt?.providerName || "Apex Premier HomeCare"}</span>
          </div>
          <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <Shield size={14} /> Verified Partner
          </div>
        </div>

        {/* Itemized Line Table */}
        <table className="cc-receipt-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong style={{ display: "block" }}>{receipt?.serviceTitle || "Deep Home Cleaning & Sanitization"}</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>On-demand local service execution</span>
              </td>
              <td style={{ textAlign: "right", fontWeight: "600" }}>${receipt?.subtotal?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Platform Processing & Protection Fee (10%)</td>
              <td style={{ textAlign: "right" }}>${receipt?.platformFee?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Estimated Service Tax (5%)</td>
              <td style={{ textAlign: "right" }}>${receipt?.taxAmount?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals Box */}
        <div className="cc-receipt-totals">
          <div className="cc-receipt-row">
            <span>Payment Method:</span>
            <span>{receipt?.paymentMethod} ({receipt?.cardLast4 ? `**** ${receipt.cardLast4}` : "Instant"})</span>
          </div>
          <div className="cc-receipt-row grand-total">
            <span>Total Paid ({receipt?.currency || "USD"}):</span>
            <span style={{ color: "#0284c7" }}>${receipt?.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="cc-receipt-footer-note">
          <p>Thank you for booking with ClickCart AI-Powered Local Services Marketplace.</p>
          <p>This electronic receipt is official proof of transaction stored in MongoDB persistence under record <code>{receipt?.paymentId}</code>.</p>
        </div>
      </div>
    </div>
  );
}
