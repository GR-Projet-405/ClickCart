import { useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";

function formatServiceAmount(value) {
  const [whole, fraction] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

function createSplitId(entries) {
  const existingIds = new Set(entries.flatMap((entry) => [entry.transactionId, entry.publicId].filter(Boolean)));
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const random = crypto.getRandomValues(new Uint32Array(3));
    const id = `${String.fromCharCode(65 + random[0] % 26)}${String.fromCharCode(65 + random[1] % 26)}${String(random[2] % 1000).padStart(3, "0")}`;
    if (!existingIds.has(id)) return id;
  }
  throw new Error("Unable to generate an unused split ID. Please try again.");
}

export default function CommissionSimulator({ rules = [], history = [], onSaved, loading = false, error = "" }) {
  const searchId = useId();
  const searchInput = useRef(null);
  const clearSearch = () => { setQuery(""); searchInput.current?.focus(); };
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const visibleHistory = history.filter((entry) => [entry.publicId, entry.transactionId].some((id) => id?.toLowerCase().includes(query.trim().toLowerCase())));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const transactionId = useRef(null);
  const activeCategories = new Set(rules.filter((rule) => rule.status === "ACTIVE").map((rule) => rule.category?.toLowerCase()));
  const stoppedCategories = new Set(rules.filter((rule) => rule.status === "PAUSED" && !activeCategories.has(rule.category?.toLowerCase())).map((rule) => rule.category?.toLowerCase()));
  const isStopped = (categoryName) => stoppedCategories.has(categoryName?.toLowerCase());
  const categories = [...new Set(rules.filter((rule) => rule.status === "ACTIVE").map((rule) => rule.category).filter(Boolean))];
  const [form, setForm] = useState({ amount: "", category: "" });
  const category = categories.includes(form.category) ? form.category : "";
  const now = Date.now();
  const matchingRule = rules
    .filter((rule) => Boolean(category) && rule.status === "ACTIVE"
      && (rule.category?.toLowerCase() === category.toLowerCase() || rule.category?.toUpperCase() === "ALL")
      && (!rule.effectiveStartDate || new Date(rule.effectiveStartDate).getTime() <= now)
      && (!rule.expiryDate || now < new Date(rule.expiryDate).getTime()))
    .sort((left, right) => (right.priority || 0) - (left.priority || 0)
      || new Date(right.effectiveStartDate || 0) - new Date(left.effectiveStartDate || 0)
      || String(left.id).localeCompare(String(right.id)))[0];
  const amount = Math.max(0, Number(form.amount) || 0);
  const rate = Number(matchingRule?.rate || 0);
  const fixedFee = Number(matchingRule?.fixedFee || 0);
  const percentage = Math.round((amount * rate / 100 + Number.EPSILON) * 100) / 100;
  const percentageOnly = fixedFee === 0 && rate > 0;
  let commission = matchingRule?.commissionType === "FIXED_FEE" ? (percentageOnly ? percentage : fixedFee)
    : matchingRule?.commissionType === "HYBRID" ? percentage + fixedFee : percentage;
  commission = Math.max(commission, Number(matchingRule?.minimumFee || 0));
  if (matchingRule?.maximumFee != null) commission = Math.min(commission, Number(matchingRule.maximumFee));
  commission = Math.min(amount, Math.max(0, commission));
  const ready = !loading && !error && Boolean(matchingRule);
  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setSaveError("");
    transactionId.current = null;
  };
  const changeAmount = (event) => {
    const input = event.target;
    const value = input.value.replace(/,/g, "");
    if (!/^\d*(\.\d{0,2})?$/.test(value)) return;
    const charactersBeforeCaret = input.value.slice(0, input.selectionStart).replace(/,/g, "").length;
    update("amount", value);
    requestAnimationFrame(() => {
      let position = 0;
      let characters = 0;
      while (position < input.value.length && characters < charactersBeforeCaret) {
        if (input.value[position] !== ",") characters += 1;
        position += 1;
      }
      input.setSelectionRange(position, position);
    });
  };
  const confirmChange = (entry, action) => {
    const expected = entry?.publicId || entry?.transactionId;
    if (!expected) return null;
    const entered = window.prompt(`Enter unique ID ${expected} to ${action}.`);
    if (entered === null) return null;
    if (entered.trim().toUpperCase() !== expected.toUpperCase()) {
      setSaveError("Unique ID does not match. No changes were made.");
      return null;
    }
    return entered.trim();
  };
  const save = async (event) => {
    event.preventDefault();
    if (!ready || saving || deletingId || saved || amount <= 0) return;
    const confirmationId = editingId ? confirmChange(history.find((entry) => entry.transactionId === editingId), "update this split") : null;
    if (editingId && !confirmationId) return;
    setSaving(true);
    setSaveError("");
    try {
      if (!editingId) transactionId.current ||= createSplitId(history);
      const response = await fetch(editingId ? `/api/admin/commission/transactions/${encodeURIComponent(editingId)}` : "/api/admin/commission/transactions", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...(confirmationId ? { "X-Split-Confirmation": confirmationId } : {}) },
        body: JSON.stringify({ transactionId: transactionId.current, bookingAmount: amount, category, service: category, providerTier: null }),
      });
      if (!response.ok) throw new Error("Unable to save the split. Check the active commission rule and try again.");
      await response.json();
      setSaved(true);
      setEditingId(null);
      onSaved?.();
    } catch (failure) {
      setSaveError(failure.message || "Unable to save the split. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ amount: "", category: "" });
    setSaved(false);
    setSaveError("");
    transactionId.current = null;
  };
  const edit = (entry) => {
    setEditingId(entry.transactionId);
    setForm({ amount: String(entry.bookingAmount), category: entry.category });
    setSaved(false);
    setSaveError("");
    transactionId.current = null;
  };
  const remove = async (entry) => {
    if (saving || deletingId) return;
    const confirmationId = confirmChange(entry, "delete this split");
    if (!confirmationId) return;
    setDeletingId(entry.transactionId);
    setSaveError("");
    try {
      const response = await fetch(`/api/admin/commission/transactions/${encodeURIComponent(entry.transactionId)}`, { method: "DELETE", headers: { "X-Split-Confirmation": confirmationId } });
      if (!response.ok) throw new Error("Unable to delete the split. Please try again.");
      if (editingId === entry.transactionId) cancelEdit();
      setSaved(false);
      onSaved?.();
    } catch (failure) {
      setSaveError(failure.message);
    } finally {
      setDeletingId(null);
    }
  };

  const togglePaid = async (entry) => {
    if (saving || deletingId || loading) return;
    const paid = entry.status !== "SETTLED";
    const confirmationId = confirmChange(entry, `turn Paid ${paid ? "on" : "off"}`);
    if (!confirmationId) return;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/commission/transactions/${encodeURIComponent(entry.transactionId)}/paid`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Split-Confirmation": confirmationId },
        body: JSON.stringify({ paid }),
      });
      if (!response.ok) throw new Error("Unable to change the Paid state. Please try again.");
      onSaved?.();
    } catch (failure) {
      setSaveError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  return <section className="commission-simulator">
    <div><span className="commission-eyebrow">COMMISSION SPLIT</span><h2>Split simulator</h2><p>Choose a category, then enter the service amount. The commission rate comes automatically from the active commission rule.</p></div>
    <form onSubmit={save}>
    {editingId && <p>Updating split <strong>{history.find((entry) => entry.transactionId === editingId)?.publicId || editingId}</strong>. Amounts are recalculated using the current active rule.</p>}
    {form.category && !category && <p role="status">{form.category} is unavailable. Activate its commission rule or select an active category.</p>}
    <fieldset disabled={saving || Boolean(deletingId)} style={{ border: 0, padding: 0, margin: 0 }}>
    <div className="commission-form-grid">
      <label>Service amount<input placeholder="XXX,XXX.XXX" type="text" inputMode="decimal" required value={formatServiceAmount(form.amount)} onChange={changeAmount} /></label>
      <label>Category<select required value={category} disabled={loading || !categories.length} onChange={(event) => update("category", event.target.value)}>
        <option value="" disabled>XXXXXX</option>
        {categories.map((value) => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <label>Commission rate (%)<input value={ready ? rate : ""} placeholder="XX" readOnly /></label>
      <div className="commission-simulator__actions">
    <button className="commission-edit-button" type="submit" disabled={!ready || saving || Boolean(deletingId) || saved || amount <= 0}>{saving ? "Saving…" : saved ? "Saved" : editingId ? "Update split" : "Save split"}</button>
    {editingId && <button type="button" className="commission-edit-button" disabled={saving || Boolean(deletingId)} onClick={cancelEdit}>Cancel update</button>}
      </div>
    </div>
    </fieldset>
    {(loading || error || (category && !matchingRule)) && <p role="status">{loading ? "Loading commission rules…" : error || "No active rule matches this category. Create or activate a matching commission rule to calculate the split."}</p>}
    <div className="commission-simulator__result" aria-live="polite">
      <div><span>Platform commission</span><strong>{ready ? `${commission.toFixed(2)} LKR` : "—"}</strong></div>
      <div><span>Provider payout</span><strong>{ready ? `${(amount - commission).toFixed(2)} LKR` : "—"}</strong></div>
      <div><span>Effective rate</span><strong>{ready ? `${amount ? ((commission / amount) * 100).toFixed(2) : "0.00"}%` : "—"}</strong></div>
    </div>
    {saveError && <p role="alert">{saveError}</p>}
    {saved && <p role="status">Split saved. Dashboard totals have been updated.</p>}
    </form>
    <div className="split-search-panel">
      <div className="split-search-panel__heading">
        <h2>Saved splits <span className="split-search-panel__badge">{history.length}</span></h2>
        <p>Find a saved split using its unique ID.</p>
      </div>
      <div className="split-id-search">
        <label htmlFor={searchId}>Search unique ID</label>
        <div className="split-id-search__control">
          <Search size={18} aria-hidden="true" />
          <input ref={searchInput} id={searchId} type="search" placeholder="Enter ID, e.g. AB123" autoComplete="off" spellCheck={false} value={query} aria-describedby={`${searchId}-hint`} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") clearSearch(); }} />
          {query && <button type="button" onClick={clearSearch} aria-label="Clear ID search"><X size={16} aria-hidden="true" /></button>}
        </div>
        <div className="split-id-search__meta"><span id={`${searchId}-hint`}>Full or partial ID</span><span role="status">{query.trim() ? `${visibleHistory.length} of ${history.length} splits` : `${history.length} saved ${history.length === 1 ? "split" : "splits"}`}</span></div>
      </div>
    </div>
    {visibleHistory.length ? <div className="commission-table-wrap"><table className="commission-table">
      <thead><tr><th>Unique ID</th><th>Date</th><th>Category</th><th>Service amount</th><th>Commission</th><th>Provider payout</th><th>Status</th><th>Paid</th><th>Actions</th></tr></thead>
      <tbody>{visibleHistory.map((entry) => <tr key={entry.transactionId} className={isStopped(entry.category) ? "commission-split--stopped" : undefined}>
        <td>{entry.publicId || entry.transactionId}</td><td>{new Date(entry.date).toLocaleString()}</td><td>{entry.category}{isStopped(entry.category) && <span className="commission-category-stopped">Category stopped</span>}</td>
        <td>{Number(entry.bookingAmount).toFixed(2)} LKR</td><td>{Number(entry.commissionAmount).toFixed(2)} LKR</td>
        <td>{Number(entry.providerEarning).toFixed(2)} LKR</td><td>{entry.status}</td>
        <td><button type="button" role="switch" aria-checked={entry.status === "SETTLED"} aria-label={`Paid for ${entry.publicId || entry.transactionId}`} className={`split-paid-toggle ${entry.status === "SETTLED" ? "split-paid-toggle--on" : ""}`} disabled={saving || Boolean(deletingId) || loading} onClick={() => togglePaid(entry)}><span aria-hidden="true" />{entry.status === "SETTLED" ? "On" : "Off"}</button></td>
        <td><div className="commission-row-actions"><button type="button" className="commission-edit-button" disabled={saving || Boolean(deletingId) || loading} onClick={() => edit(entry)}>Update</button><button type="button" className="commission-stop-button" disabled={saving || Boolean(deletingId) || loading} onClick={() => remove(entry)}>{deletingId === entry.transactionId ? "Deleting…" : "Delete"}</button></div></td>
      </tr>)}</tbody>
    </table></div> : <div className="split-search-empty"><Search size={24} aria-hidden="true" /><strong>{query.trim() ? "No matching splits" : "No saved splits yet"}</strong><p>{query.trim() ? "Check the ID or try fewer characters." : "Save your first split to see it here."}</p>{query.trim() && <button type="button" onClick={clearSearch}>Clear search</button>}</div>}
  </section>;
}
