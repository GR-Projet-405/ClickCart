import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserRoundCheck, CalendarCheck, CreditCard, RefreshCw } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageContainer from "../../components/common/PageContainer";
import StatCard from "../../components/admin/StatCard";
import VerificationQueuePreview from "../../components/admin/VerificationQueuePreview";
import RevenueOverviewPreview from "../../components/admin/RevenueOverviewPreview";
import CategoriesPreview from "../../components/admin/CategoriesPreview";
import RecentActionsPreview from "../../components/admin/RecentActionsPreview";
import useAdminDashboard from "../../hooks/useAdminDashboard";
import { adminRequest } from "../../services/adminWorkspaceService";
import "./AdminDashboardPage.css";
export default function AdminDashboardPage() {
  const sections = useAdminDashboard();
  const [summary, setSummary] = useState(null), [error, setError] = useState("");
  const loadSummary = async () => { setSummary(null); setError(""); try { setSummary(await adminRequest("/summary")); } catch(e) { setError(e.message); } };
  useEffect(() => { loadSummary(); }, []);
  const cards = [["users", "Registered users", Users], ["providers", "Provider accounts", UserRoundCheck], ["bookings", "Bookings", CalendarCheck], ["payments", "Payment records", CreditCard]];
  return <PageContainer className="adm-dashboard">
    <header className="adm-header"><div><h1 className="cc-h1">Platform Admin Dashboard</h1><p>Manage your marketplace using records from your database.</p></div><Button variant="outline" loading={sections.refreshing} leftIcon={<RefreshCw size={16}/>} onClick={() => { sections.reload(); loadSummary(); }}>Refresh</Button></header>
    {error && <p role="alert">Could not load totals: {error}</p>}
    <section className="adm-summary">{cards.map(([id,label,icon]) => <StatCard key={id} id={id} label={label} icon={icon} value={summary ? summary[id].toLocaleString() : error ? "Unavailable" : "…"} hint="All time" />)}</section>
    <div className="adm-dashboard-columns"><div className="adm-dashboard-column adm-dashboard-column--wide">
      <Section title="Provider verification" to="/admin/providers" section={sections.verification}><VerificationQueuePreview {...sections.verification}/></Section>
      <Section title="Commission overview" to="/commission_management" section={sections.revenue}><RevenueOverviewPreview {...sections.revenue}/></Section>
    </div><div className="adm-dashboard-column adm-dashboard-column--narrow">
      <Section title="Service categories" to="/admin/categories" section={sections.categories}><CategoriesPreview {...sections.categories}/></Section>
      <Section title="Recent commission actions" section={sections.audit}><RecentActionsPreview {...sections.audit}/></Section>
    </div></div>
  </PageContainer>;
}
function Section({title,to,section,children}) { return <Card className="adm-section" padding="none"><header className="adm-section__header"><h2 className="adm-section__title">{title}</h2>{to && <Link className="adm-section__link" to={to}>View all →</Link>}</header><div className="adm-section__body">{section.error ? <p role="alert">Could not load this section. {section.error} Use Refresh to try again.</p> : children}</div></Card>; }
