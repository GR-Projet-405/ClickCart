import { useEffect, useState } from "react";
import { commissionFetch } from "../../services/commissionApi";
export default function PayoutRequests() {
 const [entries, setEntries] = useState([]), [error,setError] = useState(""), [busy,setBusy] = useState(false);
 async function load() { try { const response = await commissionFetch("/api/admin/payouts"); if (!response.ok) throw new Error("Unable to load payout requests"); setEntries(await response.json()); } catch(err) { setError(err.message); } }
 useEffect(() => { load(); }, []);
 async function review(entry,status) {
  const reference = window.prompt(status === "SETTLED" ? "Enter the bank transfer reference after completing the transfer:" : "Enter the reason for rejecting this payout:");
  if (!reference?.trim()) return;
  setBusy(true); setError("");
  try { const response = await commissionFetch(`/api/admin/payouts/${entry.providerId}/${entry.request.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"},body:JSON.stringify({status,reference}) }); if (!response.ok) throw new Error((await response.json()).message || "Unable to review this payout"); await load(); } catch(err) { setError(err.message); } finally { setBusy(false); }
 }
 return <section className="commission-panel"><h2>Payout requests</h2><p>Record completed bank transfers or reject a request to release its reserved balance.</p>{error && <p role="alert" className="commission-error">{error}</p>}<div className="commission-table-wrap"><table className="commission-table"><thead><tr><th>Provider</th><th>Bank / account</th><th>Amount</th><th>Status</th><th>Review</th></tr></thead><tbody>{entries.map(entry => <tr key={entry.request.id}><td>{entry.providerId}</td><td>{entry.request.bankName}<br/>{entry.request.accountNumber}</td><td>LKR {Number(entry.request.amount).toLocaleString()}</td><td>{entry.request.status}</td><td>{entry.request.status === "REQUESTED" && <div className="commission-row-actions"><button disabled={busy} onClick={() => review(entry,"SETTLED")}>Record transfer</button><button disabled={busy} onClick={() => review(entry,"REJECTED")}>Reject</button></div>}</td></tr>)}</tbody></table>{!entries.length && <p>No payout requests yet.</p>}</div></section>;
}
