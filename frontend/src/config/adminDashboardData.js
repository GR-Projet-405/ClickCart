import {
  BriefcaseBusiness,
  CalendarCheck,
  CircleAlert,
  CircleDollarSign,
  ShieldCheck,
  Users,
} from "lucide-react";

/**
 * Platform Admin Dashboard data + fallbacks.
 *
 * 1) `adminSummaryCards` - Phase 2 mock UI values for the six summary cards.
 *    Static presentation values only, intentionally not fetched from an API.
 *
 * 2) `fallback*` - clearly separated fallback data used ONLY when an existing
 *    API is unavailable (backend down, auth required, empty response).
 *    Real API data always wins when the request succeeds.
 */

/* ------------------------------------------------------------------ *
 * Phase 2 — summary / stat cards (mock UI values)
 * ------------------------------------------------------------------ */

export const adminSummaryCards = [
  {
    id: "total-users",
    label: "Total Users",
    value: "12,482",
    trend: "+12%",
    trendDirection: "positive",
    hint: "vs last month",
    icon: Users,
    tone: "green",
  },
  {
    id: "active-providers",
    label: "Active Providers",
    value: "2,841",
    trend: "+8%",
    trendDirection: "positive",
    hint: "vs last month",
    icon: BriefcaseBusiness,
    tone: "blue",
  },
  {
    id: "total-bookings",
    label: "Total Bookings",
    value: "8,932",
    trend: "+15%",
    trendDirection: "positive",
    hint: "vs last month",
    icon: CalendarCheck,
    tone: "neutral",
  },
  {
    id: "gmv-revenue",
    label: "GMV / Revenue",
    value: "LKR 12.4M",
    trend: "+18%",
    trendDirection: "positive",
    hint: "vs last month",
    icon: CircleDollarSign,
    tone: "green",
  },
  {
    id: "open-disputes",
    label: "Open Disputes",
    value: "24",
    trend: "+33%",
    trendDirection: "positive",
    hint: "vs last month",
    icon: CircleAlert,
    tone: "red",
  },
  {
    id: "pending-verifications",
    label: "Pending Verifications",
    value: "67",
    trend: "-28%",
    trendDirection: "negative",
    /* Fewer pending verifications is an improvement, so the trend renders
       in the positive/green treatment even though the number decreased. */
    trendTone: "positive",
    hint: "vs last month",
    icon: ShieldCheck,
    tone: "amber",
  },
];

/* ------------------------------------------------------------------ *
 * Phase 3 — Provider Verification Queue fallback
 * `id: null` marks a sample row, so approve/reject stay disabled.
 * ------------------------------------------------------------------ */

export const fallbackVerificationRows = [
  {
    id: null,
    name: "Nimal Perera",
    category: "Plumbing",
    submittedAt: "2h ago",
    avatar: null,
    status: "PENDING",
  },
  {
    id: null,
    name: "Ayesha Fernando",
    category: "Cleaning",
    submittedAt: "5h ago",
    avatar: null,
    status: "PENDING",
  },
  {
    id: null,
    name: "Kasun Silva",
    category: "Electrical Repairs",
    submittedAt: "Yesterday",
    avatar: null,
    status: "PENDING",
  },
  {
    id: null,
    name: "Ruwan Jayasuriya",
    category: "Beauty & Wellness",
    submittedAt: "2 days ago",
    avatar: null,
    status: "PENDING",
  },
];

/* ------------------------------------------------------------------ *
 * Phase 3 — Revenue & Commission Overview fallback
 * The commission API does not expose GMV or refunds, so those two stay
 * explicit mock values and only the commission figure comes from the API.
 * ------------------------------------------------------------------ */

export const fallbackRevenue = {
  metrics: {
    totalGmv: "LKR 12,458,320",
    platformCommission: "LKR 1,867,748",
    totalRefunds: "LKR 234,500",
  },
  trend: [
    { id: "Day 01", date: "2026-09-19", value: 421500 },
    { id: "Day 02", date: "2026-09-20", value: 511200 },
    { id: "Day 03", date: "2026-09-21", value: 398400 },
    { id: "Day 04", date: "2026-09-22", value: 640900 },
    { id: "Day 05", date: "2026-09-23", value: 587300 },
    { id: "Day 06", date: "2026-09-24", value: 712600 },
    { id: "Day 07", date: "2026-09-25", value: 655100 },
    { id: "Day 08", date: "2026-09-26", value: 804750 },
    { id: "Day 09", date: "2026-09-27", value: 762300 },
    { id: "Day 10", date: "2026-09-28", value: 918400 },
    { id: "Day 11", date: "2026-09-29", value: 847650 },
    { id: "Day 12", date: "2026-09-30", value: 1024300 },
    { id: "Day 13", date: "2026-10-01", value: 963700 },
    { id: "Day 14", date: "2026-10-02", value: 1148900 },
  ],
};

/* ------------------------------------------------------------------ *
 * Phase 3 — Service Categories Management fallback
 * `id: null` marks a sample row so it never pretends to be editable.
 * ------------------------------------------------------------------ */

export const fallbackCategories = {
  total: 12,
  active: 10,
  rows: [
    { id: null, name: "Home Services", icon: "Home", services: 48, active: true },
    { id: null, name: "Cleaning", icon: "Sparkles", services: 26, active: true },
    { id: null, name: "Repairs & Maintenance", icon: "Wrench", services: 34, active: true },
    { id: null, name: "Beauty & Wellness", icon: "HeartPulse", services: 19, active: true },
  ],
};

/* ------------------------------------------------------------------ *
 * Phase 3 — Recent Admin Actions fallback
 * Mirrors the shape returned by GET /admin/commission/audit-logs
 * ------------------------------------------------------------------ */

export const fallbackAuditLog = [
  {
    id: "audit-1",
    action: "Approved provider verification",
    actor: "Platform Admin",
    timestamp: "12 minutes ago",
  },
  {
    id: "audit-2",
    action: "Updated commission rule",
    actor: "Platform Admin",
    timestamp: "48 minutes ago",
  },
  {
    id: "audit-3",
    action: "Paused category rule",
    actor: "Platform Admin",
    timestamp: "2 hours ago",
  },
  {
    id: "audit-4",
    action: "Marked settlement as paid",
    actor: "Platform Admin",
    timestamp: "5 hours ago",
  },
];

/* ------------------------------------------------------------------ *
 * Phase 4 — Reported Content & Moderation (sample data)
 *
 * There is no admin moderation API yet, so this dataset is the source of
 * truth for the panel. Swap the prop on ModerationPreview when a real
 * endpoint exists — the component only reads these field names.
 * ------------------------------------------------------------------ */

export const moderationPreviewData = [
  {
    id: "REP-1042",
    content: "Home Cleaning Service",
    type: "Service Listing",
    reason: "Misleading information",
    status: "Pending",
    reportedAt: "2 hours ago",
  },
  {
    id: "REP-1038",
    content: "AC Repair & Maintenance",
    type: "Service Listing",
    reason: "Inappropriate content",
    status: "Under Review",
    reportedAt: "5 hours ago",
  },
  {
    id: "REP-1031",
    content: "Provider profile",
    type: "Provider",
    reason: "False information",
    status: "Pending",
    reportedAt: "1 day ago",
  },
  {
    id: "REP-1027",
    content: "Customer review",
    type: "Review",
    reason: "Spam",
    status: "Resolved",
    reportedAt: "1 day ago",
  },
];

/* ------------------------------------------------------------------ *
 * Phase 4 — Disputes & Support Cases (sample data)
 *
 * There is no admin disputes/support API yet. DisputesPreview reads only
 * these field names, so real data can replace the array later unchanged.
 * ------------------------------------------------------------------ */

export const disputesPreviewData = [
  {
    id: "DSP-2041",
    subject: "Booking cancellation refund",
    category: "Refund",
    priority: "High",
    status: "Open",
    updatedAt: "20 minutes ago",
  },
  {
    id: "DSP-2037",
    subject: "Provider did not arrive",
    category: "Service Issue",
    priority: "Medium",
    status: "Under Review",
    updatedAt: "1 hour ago",
  },
  {
    id: "DSP-2032",
    subject: "Payment amount disputed",
    category: "Payment",
    priority: "High",
    status: "Open",
    updatedAt: "3 hours ago",
  },
  {
    id: "DSP-2026",
    subject: "Poor service quality",
    category: "Service Quality",
    priority: "Low",
    status: "Resolved",
    updatedAt: "1 day ago",
  },
];

/* ------------------------------------------------------------------ *
 * Phase 5 — Bookings Trend (sample data)
 *
 * There is no admin booking-analytics API yet, so this dataset is the
 * source of truth for BookingsTrendPreview. The component only reads
 * { label, bookings } from each point, so a real endpoint can replace
 * the array later without touching the chart.
 * ------------------------------------------------------------------ */

export const bookingsTrendData = [
  { label: "Apr 1", bookings: 820 },
  { label: "Apr 5", bookings: 910 },
  { label: "Apr 10", bookings: 870 },
  { label: "Apr 15", bookings: 1040 },
  { label: "Apr 20", bookings: 1120 },
  { label: "Apr 25", bookings: 1080 },
  { label: "Apr 30", bookings: 1240 },
];

/* ------------------------------------------------------------------ *
 * Phase 6 — System Status & Notifications (sample data)
 *
 * There is no admin system-status or notification API yet, so these two
 * arrays are the source of truth for SystemStatusPreview. The component
 * only reads the fields below, so a real endpoint can replace either
 * array later without touching the UI:
 *   systemStatus:  { name, status, detail }
 *   notification:  { id, title, type, time }
 * ------------------------------------------------------------------ */

export const systemStatusData = [
  {
    name: "Marketplace API",
    status: "Operational",
    detail: "All systems operational",
  },
  {
    name: "Payment Services",
    status: "Operational",
    detail: "Processing normally",
  },
  {
    name: "Database",
    status: "Operational",
    detail: "Healthy",
  },
  {
    name: "Notification Service",
    status: "Degraded",
    detail: "Minor delays detected",
  },
];

export const adminNotificationData = [
  {
    id: "NOT-104",
    title: "5 provider verification requests pending",
    type: "verification",
    time: "15 minutes ago",
  },
  {
    id: "NOT-103",
    title: "2 new disputes require attention",
    type: "dispute",
    time: "1 hour ago",
  },
  {
    id: "NOT-102",
    title: "Commission report generated successfully",
    type: "system",
    time: "3 hours ago",
  },
];

export default adminSummaryCards;
