import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, FileText, Plus, ShieldCheck, Search, Filter } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import { paymentService } from "../../services/paymentService";
import "./PaymentHistoryPage.css";

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const list = await paymentService.getCustomerPaymentHistory("CUST-101");
        setPayments(list);
      } catch (err) {
        console.error("Failed to load payment history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = payments.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      (p.serviceTitle || "").toLowerCase().includes(query) ||
      (p.receiptNumber || "").toLowerCase().includes(query) ||
      (p.providerName || "").toLowerCase().includes(query) ||
      (p.bookingId || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="cc-history-container">
      <div className="cc-history-header">
        <div className="cc-history-title-box">
          <Badge variant="primary">DEV-26 Shermi Weerasinghe</Badge>
          <h1 style={{ marginTop: "6px" }}>Customer Payment History</h1>
          <p>Track all completed transactions, digital receipts, and payment receipts.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate("/checkout?bookingId=BKG-DEMO-99")}>
          New Test Checkout
        </Button>
      </div>

      <div style={{ marginBottom: "20px", maxWidth: "400px" }}>
        <Input
          placeholder="Search by receipt no, service, provider..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="cc-history-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading payment history from server...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No payment records found.
          </div>
        ) : (
          <table className="cc-history-table">
            <thead>
              <tr>
                <th>Receipt / Date</th>
                <th>Service & Provider</th>
                <th>Booking Ref</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id || item.receiptNumber}>
                  <td>
                    <div style={{ fontWeight: "600" }}>{item.receiptNumber || "REC-2026-PENDING"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : "Just now"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600" }}>{item.serviceTitle || "Local Service"}</div>
                    <div style={{ fontSize: "12px", color: "#0284c7" }}>{item.providerName || "Verified Provider"}</div>
                  </td>
                  <td>
                    <code>{item.bookingId}</code>
                  </td>
                  <td style={{ fontWeight: "700", color: "#0f172a" }}>
                    ${item.amount?.toFixed ? item.amount.toFixed(2) : item.amount} {item.currency || "USD"}
                  </td>
                  <td>
                    <Badge variant={item.status === "COMPLETED" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FileText size={14} />}
                      onClick={() => navigate(`/receipt/${item.receiptNumber || item.id}`)}
                    >
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
