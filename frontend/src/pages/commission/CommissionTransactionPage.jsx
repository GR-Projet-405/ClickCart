import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommissionTransactionForm from "../../components/commission/CommissionTransactionForm";
import "./CommissionDashboard.css";

export default function CommissionTransactionPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ transactionId: "", customer: "", provider: "", service: "", bookingAmount: "", category: "", providerTier: "GOLD" });
  const submit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/admin/commission/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, bookingAmount: Number(form.bookingAmount) }) });
    if (!response.ok) { setError("The transaction could not be recorded. Check that an active rule matches this category and tier."); return; }
    navigate("/commission_management");
  };
  return <div className="commission-page commission-page--form"><button className="commission-back-link" onClick={() => navigate("/commission_management")}><ArrowLeft size={16} /> Back to dashboard</button><div className="commission-form-page__heading"><span className="commission-eyebrow">TRANSACTION / DEV-27</span><h1>Record commission transaction</h1><p>Enter a verified booking to create an immutable commission snapshot.</p></div>{error && <div className="commission-error">{error}</div>}<CommissionTransactionForm form={form} setForm={setForm} onSubmit={submit} onCancel={() => navigate("/commission_management")} /></div>;
}
