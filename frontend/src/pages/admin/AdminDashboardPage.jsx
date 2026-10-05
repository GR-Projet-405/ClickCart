import {
  ArrowRight,
  BarChart3,
  Bell,
  Clock,
  Download,
  Flag,
  FolderTree,
  Percent,
  RefreshCw,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageContainer from "../../components/common/PageContainer";
import StatCard from "../../components/admin/StatCard";
import VerificationQueuePreview from "../../components/admin/VerificationQueuePreview";
import RevenueOverviewPreview from "../../components/admin/RevenueOverviewPreview";
import CategoriesPreview from "../../components/admin/CategoriesPreview";
import RecentActionsPreview from "../../components/admin/RecentActionsPreview";
import ModerationPreview from "../../components/admin/ModerationPreview";
import DisputesPreview from "../../components/admin/DisputesPreview";
import BookingsTrendPreview from "../../components/admin/BookingsTrendPreview";
import SystemStatusPreview from "../../components/admin/SystemStatusPreview";
import useAdminDashboard from "../../hooks/useAdminDashboard";
import { adminSummaryCards } from "../../config/adminDashboardData";

import "./AdminDashboardPage.css";

/**
 * Platform Admin Dashboard.
 *
 * Phase 1: page shell, header, responsive section grid.
 * Phase 2: six summary / stat cards (mock UI values).
 * Phase 3: four API-backed section previews —
 *   Provider Verification Queue, Revenue & Commission Overview,
 *   Service Categories Management, Recent Admin Actions.
 * Phase 4: two sample-data section previews —
 *   Reported Content & Moderation, Disputes & Support Cases.
 * Phase 5: Bookings Trend chart (SVG, sample data, no API yet).
 * Phase 6: System Status & Notifications preview (sample data, no API yet).
 *
 * Every grid section now renders real content; no placeholders remain.
 * Sidebar / top bar / header chrome come from AdminLayout and are not
 * recreated here.
 */

function DashboardSection({
  id,
  icon: Icon,
  title,
  subtitle,
  action,
  className = "",
  children,
}) {
  return (
    <Card padding="none" className={`adm-section ${className}`.trim()}>
      <header className="adm-section__header">
        <span className="adm-section__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <div className="adm-section__heading">
          <h2 className="adm-section__title" id={`${id}-title`}>
            {title}
          </h2>
          <p className="adm-section__subtitle">{subtitle}</p>
        </div>
        {action ? <div className="adm-section__action">{action}</div> : null}
      </header>
      <div className="adm-section__body">{children}</div>
    </Card>
  );
}

/**
 * Header action for sections that are still backed by sample data.
 *
 * There is no moderation or disputes workspace page yet, so the button is
 * shown but deliberately performs no navigation (no dead route is created).
 * When a real page ships, swap it for <Link to="…"> like SectionAction.
 */
function SampleDataAction({ label, icon }) {
  return (
    <>
      <Badge variant="neutral">Sample data</Badge>
      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={icon}
        aria-disabled="true"
        title="Available once the workspace page is released"
      >
        {label}
      </Button>
    </>
  );
}

/** "View All" style header link + a badge flagging fallback data. */
function SectionAction({ section, to, label }) {
  const usingFallback = section.source === "fallback" && !section.loading;

  return (
    <>
      {usingFallback ? <Badge variant="neutral">Sample data</Badge> : null}
      <Link className="adm-section__link" to={to}>
        {label}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </>
  );
}

export default function AdminDashboardPage() {
  const {
    verification,
    revenue,
    categories,
    audit,
    refreshing,
    reload,
  } = useAdminDashboard();

  return (
    <PageContainer className="adm-dashboard">
      <header className="adm-header">
        <div className="adm-header__text">
          <h1 className="cc-h1 adm-header__title">Platform Admin Dashboard</h1>
          <p className="cc-body cc-text-secondary adm-header__subtitle">
            Monitor and manage your ClickCart marketplace operations
          </p>
        </div>

        <div className="adm-header__actions">
          <span className="adm-header__range">Last 30 days</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={15} />}
            loading={refreshing}
            onClick={reload}
          >
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            leftIcon={<Download size={15} />}
          >
            Export report
          </Button>
        </div>
      </header>

      {/* ---------------------------------------------- */}
      {/* Summary / stat cards (Phase 2 — mock UI data)   */}
      {/* ---------------------------------------------- */}
      <section className="adm-summary" aria-label="Marketplace summary">
        {adminSummaryCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </section>

      {/* ------------------------------------------------ */}
      {/* Main dashboard — two independent column flows     */}
      {/* ------------------------------------------------ */}
      {/* Each column stacks its own cards, so a tall card  */}
      {/* never creates empty space under the card next to  */}
      {/* it in the other column. The wide column keeps the */}
      {/* existing 8/12 proportion and the narrow one 4/12. */}
      {/* ------------------------------------------------ */}
      <div className="adm-dashboard-columns">
        <div className="adm-dashboard-column adm-dashboard-column--wide">
          <DashboardSection
            id="verification-queue"
            className="adm-col--8"
            icon={UserRoundCheck}
            title="Provider Verification Queue"
            subtitle="Review pending provider verification requests"
            action={
              <SectionAction
                section={verification}
                to="/admin/providers"
                label="View All"
              />
            }
          >
            <VerificationQueuePreview {...verification} />
          </DashboardSection>

          <DashboardSection
            id="revenue-overview"
            className="adm-col--8"
            icon={Percent}
            title="Revenue & Commission Overview"
            subtitle="Marketplace earnings and payouts"
            action={
              <SectionAction
                section={revenue}
                to="/commission_management"
                label="View Details"
              />
            }
          >
            <RevenueOverviewPreview {...revenue} />
          </DashboardSection>

          <DashboardSection
            id="disputes"
            className="adm-col--4"
            icon={ShieldAlert}
            title="Disputes & Support Cases"
            subtitle="Active disputes and support cases awaiting resolution"
            action={
              <SampleDataAction
                label="View All Cases"
                icon={<ShieldAlert size={14} />}
              />
            }
          >
            <DisputesPreview />
          </DashboardSection>

          <DashboardSection
            id="system-status"
            className="adm-col--4"
            icon={Bell}
            title="System Status & Notifications"
            subtitle="Platform health and recent alerts"
          >
            <SystemStatusPreview />
          </DashboardSection>
        </div>

        <div className="adm-dashboard-column adm-dashboard-column--narrow">
          <DashboardSection
            id="moderation"
            className="adm-col--4"
            icon={Flag}
            title="Reported Content & Moderation"
            subtitle="Reported marketplace content awaiting admin review"
            action={
              <SampleDataAction
                label="Review Reports"
                icon={<Flag size={14} />}
              />
            }
          >
            <ModerationPreview />
          </DashboardSection>

          <DashboardSection
            id="bookings-trend"
            className="adm-col--4"
            icon={BarChart3}
            title="Bookings Trend"
            subtitle="Booking activity over the selected period"
            action={<span className="adm-section__tag">Last 30 days</span>}
          >
            <BookingsTrendPreview />
          </DashboardSection>

          <DashboardSection
            id="categories"
            className="adm-col--8"
            icon={FolderTree}
            title="Service Categories Management"
            subtitle="Marketplace service taxonomy"
            action={
              <SectionAction
                section={categories}
                to="/admin/categories"
                label="Manage All"
              />
            }
          >
            <CategoriesPreview {...categories} />
          </DashboardSection>

          <DashboardSection
            id="recent-actions"
            className="adm-col--8"
            icon={Clock}
            title="Recent Admin Actions"
            subtitle="Latest platform administration activity"
          >
            <RecentActionsPreview {...audit} />
          </DashboardSection>
        </div>
      </div>
    </PageContainer>
  );
}
