import { useEffect, useState } from "react";
import PageContainer from "../../components/common/PageContainer";
import Button from "../../components/common/Button";
import { adminRequest } from "../../services/adminWorkspaceService";
import "./AdminWorkspace.css";
const columns = {users:["fullName","email","role","status"],bookings:["serviceTitle","customerName","providerName","status","bookingDate"],payments:["serviceTitle","customerName","amount","currency","status","paymentMethod"]};
const label = text => text.replace(/([A-Z])/g," $1").replace(/^./, c=>c.toUpperCase());
export default function AdminRecordsPage({type}) {
 const [data,setData]=useState(null),[error,setError]=useState(""),[page,setPage]=useState(0),[version,setVersion]=useState(0);
 useEffect(()=>{ let active=true; setData(null); setError(""); adminRequest(`/records/${type}?page=${page}`).then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(e.message);}); return ()=>{active=false;}; },[type,page,version]);
 return <PageContainer className="admin-workspace"><header className="adm-header"><div><h1>{type === "payments" ? "Payment records" : label(type)}</h1><p>Stored database records · 25 per page</p></div><Button variant="outline" onClick={()=>setVersion(v=>v+1)}>Refresh</Button></header>{error ? <p role="alert">{error}</p> : !data ? <p role="status">Loading records…</p> : <><p>{data.total} records</p><div className="admin-records"><table><thead><tr>{columns[type].map(c=><th key={c}>{label(c)}</th>)}</tr></thead><tbody>{data.rows.map(row=><tr key={row.id}>{columns[type].map(c=><td key={c}>{row[c] == null ? "—" : String(row[c])}</td>)}</tr>)}</tbody></table>{!data.rows.length && <p>No records found.</p>}</div><div className="admin-pagination"><Button variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</Button><span>Page {page+1}</span><Button variant="outline" disabled={(page+1)*25>=data.total} onClick={()=>setPage(p=>p+1)}>Next</Button></div></>}</PageContainer>;
}
