import PayoutRequests from "../../components/commission/PayoutRequests";
import { commissionFetch } from "../../services/commissionApi";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Plus, Search, ShieldCheck } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import CommissionChart from "../../components/commission/CommissionChart";
import CommissionHistory from "../../components/commission/CommissionHistory";
import CommissionSimulator from "../../components/commission/CommissionSimulator";
import CommissionStatsCard from "../../components/commission/CommissionStatsCard";
import AuditLogTable from "../../components/commission/AuditLogTable";
import CommissionOverview from "./CommissionOverviewV3";
import "./CommissionDashboard.css";

const emptyRuleForm = { ruleName: "", category: "", commissionType: "", rate: "" };

export default function CommissionDashboard() {
  const [view, setView] = useState("dashboard");
  const [rules, setRules] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState({ ...emptyRuleForm });
  const filteredRules = useMemo(() => rules.filter((rule) => `${rule.ruleName} ${rule.category}`.toLowerCase().includes(query.toLowerCase())), [rules, query]);

  const loadData = () => {
    setLoading(true);
    setApiError("");
    Promise.all(["dashboard", "rules", "transactions", "audit-logs"].map((resource) => commissionFetch(`/api/admin/commission/${resource}`).then((response) => response.ok ? response.json() : Promise.reject(new Error(`Unable to load ${resource}`))))).then(([dashboardData, rulesData, historyData, auditData]) => {
      setDashboard(dashboardData);
      setRules(rulesData);
      setHistory(historyData);
      setAudit(auditData);
    }).catch((error) => setApiError(error.message)).finally(() => setLoading(false));
  };
  useEffect(() => loadData(), []);

  const saveRule = async (event) => {
    event.preventDefault();
    if (!form.ruleName.trim() || !form.category.trim() || !form.commissionType || form.rate === "" || Number(form.rate) < 0 || Number(form.rate) > 100) {
      setApiError("Enter a rule name, category, commission type, and a rate between 0 and 100.");
      return;
    }
    const rule = { ...editingRule, ...form, rate: Number(form.rate), providerTier: editingRule?.providerTier || "ALL", fixedFee: Number(form.fixedFee || 0), minimumFee: editingRule?.minimumFee || 0, priority: editingRule?.priority || 50, effectiveStartDate: editingRule?.effectiveStartDate || new Date().toISOString() };
    const endpoint = editingRule ? `/api/admin/commission/rules/${editingRule.id}` : "/api/admin/commission/rules";
    setApiError("");
    try {
      const response = await commissionFetch(endpoint, { method: editingRule ? "PUT" : "POST", headers: { "Content-Type": "application/json", ...(editingRule?.version !== undefined ? { "If-Match": editingRule.version } : {}) }, body: JSON.stringify(rule) });
      if (!response.ok) {
        let detail = "The server rejected the commission rule.";
        try {
          const body = await response.json();
          detail = body.message || body.error || detail;
        } catch { /* The server did not return a JSON error body. */ }
        setApiError(`${detail} (HTTP ${response.status})`);
        return;
      }
      setFormOpen(false); setEditingRule(null); setForm({ ...emptyRuleForm });
      loadData();
    } catch {
      setApiError("Could not reach the backend. Start the ClickCart backend and check its MongoDB connection, then try again.");
    }
  };
  const openNewRule = () => { setEditingRule(null); setForm({ ...emptyRuleForm }); setFormOpen(true); };
  const openEdit = (rule) => { setEditingRule(rule); setForm({ ruleName: rule.ruleName, category: rule.category, commissionType: rule.commissionType, rate: String(rule.rate), fixedFee: String(rule.fixedFee || 0) }); setFormOpen(true); };
  const toggleRule = async (id) => { const rule = rules.find((currentRule) => currentRule.id === id); if (!rule) return; try { const response = await commissionFetch(`/api/admin/commission/rules/${id}/status?value=${rule.status === "ACTIVE" ? "PAUSED" : "ACTIVE"}`, { method: "PATCH", headers: { "If-Match": rule.version } }); if (!response.ok) { const detail = await response.json(); throw new Error(detail.message || "Unable to update this rule"); } loadData(); } catch (err) { setApiError(err.message); } };

  if (formOpen && !editingRule) return <div className="commission-page commission-page--form"><button className="commission-back-link" onClick={() => setFormOpen(false)}><ArrowLeft size={16} /> Back to commission rules</button><div className="commission-form-page__heading"><span className="commission-eyebrow">PLATFORM POLICY / DEV-27</span><h1>Create commission rule</h1><p>Define the category, commission model, and rate used for matching marketplace bookings.</p></div><RuleForm form={form} setForm={setForm} editing={null} page error={apiError} onSubmit={saveRule} onCancel={() => setFormOpen(false)} /></div>;
  return <div className="commission-page"><div className="commission-page__heading"><div><span className="commission-eyebrow"><ShieldCheck size={14} /> PLATFORM ADMIN / DEV-27</span><h1>Commission management</h1><p>Control marketplace policy, earnings, and historical commission records.</p></div><div className="commission-page__actions"><Button leftIcon={<Plus size={16} />} onClick={openNewRule}>New rule</Button></div></div><nav className="commission-tabs"><button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>Dashboard</button><button className={view === "rules" ? "active" : ""} onClick={() => setView("rules")}>Commission rules</button><button className={view === "simulator" ? "active" : ""} onClick={() => setView("simulator")}>Split simulator</button><button className={view === "payouts" ? "active" : ""} onClick={() => setView("payouts")}>Payout requests</button></nav>{view === "payouts" && <PayoutRequests />}{view === "dashboard" && <CommissionOverview dashboard={dashboard} history={history} audit={audit} loading={loading} error={apiError} onRetry={loadData} />}{view === "simulator" && <CommissionSimulator history={history} onSaved={loadData} rules={rules} loading={loading} error={apiError} />}{view === "rules" && apiError && <p role="alert" className="commission-error">{apiError}</p>}{view === "rules" && <RulesContent rules={filteredRules} query={query} setQuery={setQuery} toggleRule={toggleRule} onEdit={openEdit} onNew={openNewRule} />}{formOpen && <RuleForm form={form} setForm={setForm} editing={editingRule} error={apiError} onSubmit={saveRule} onCancel={() => { setFormOpen(false); setEditingRule(null); }} />}</div>;
}

function RulesContent({ rules, query, setQuery, toggleRule, onEdit }) { return <Card className="commission-panel commission-rules"><div className="commission-panel__heading"><div><h2>Commission rules</h2><p>Higher priority rules win when scopes overlap.</p></div></div><div className="commission-toolbar"><div className="commission-search"><Search size={15} /><input placeholder="Search by name or category" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div><div className="commission-table-wrap"><table className="commission-table"><thead><tr><th>Rule</th><th>Category</th><th>Type</th><th>Rate</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>{rules.map((rule) => <tr key={rule.id}><td><strong>{rule.ruleName}</strong><small>{rule.id}</small></td><td>{rule.category}</td><td>{rule.commissionType}</td><td>{rule.rate}%</td><td>P{rule.priority}</td><td><span className={`commission-status commission-status--${rule.status.toLowerCase()}`}>{rule.status}</span></td><td><div className="commission-row-actions"><button className="commission-edit-button" onClick={() => onEdit(rule)}>Edit</button><button className={rule.status === "ACTIVE" ? "commission-stop-button" : "commission-activate-button"} onClick={() => toggleRule(rule.id)}>{rule.status === "ACTIVE" ? "Stop" : "Activate"}</button></div></td></tr>)}</tbody></table></div></Card>; }
function RuleForm({ form, setForm, editing, page = false, error, onSubmit, onCancel }) { const update = (key, value) => setForm({ ...form, [key]: value }); return <div className={page ? "commission-form-shell" : "commission-modal"}><form className="commission-form" onSubmit={onSubmit}><div className="commission-form__header"><div><span className="commission-eyebrow">{editing ? "EDIT POLICY" : "NEW POLICY"}</span><h2>{editing ? "Edit commission rule" : "Create commission rule"}</h2></div>{!page && <button type="button" onClick={onCancel}>Close</button>}</div>{error && <div className="commission-error" role="alert">{error}</div>}<Input label="Rule name" required value={form.ruleName} onChange={(event) => update("ruleName", event.target.value)} /><Input label="Category" placeholder="e.g. Home Services" required value={form.category} onChange={(event) => update("category", event.target.value)} /><Select label="Commission type" required value={form.commissionType} onChange={(event) => update("commissionType", event.target.value)}><option value="" disabled>Select commission type</option><option>PERCENTAGE</option><option>HYBRID</option><option>FIXED_FEE</option></Select><Input label="Rate (%)" type="number" min="0" max="100" required value={form.rate} onChange={(event) => update("rate", event.target.value)} />{form.commissionType !== "PERCENTAGE" && <Input label="Fixed fee (LKR)" type="number" min="0" step="0.01" value={form.fixedFee || ""} onChange={event => update("fixedFee", event.target.value)} />}<div className="commission-form__actions"><Button variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">{editing ? "Save changes" : "Create rule"}</Button></div></form></div>; }
