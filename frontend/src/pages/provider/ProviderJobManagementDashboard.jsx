import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Siren,
  UserRound,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import SearchInput from "../../components/common/SearchInput";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import {
  acceptProviderJob,
  getProviderJobs,
  getSelectedProviderId,
  setDemoProvider,
  startProviderJob,
} from "../../services/providerJobService";
import {
  elapsedLabel,
  formatLkr,
  formatLkrCompact,
  initials,
  isActive,
  isSameDay,
  isUpcoming,
  mapsUrl,
  paymentLabel,
  statusLabel,
  weekRevenue,
} from "./jobUi";
import "./providerJobs.css";

const TABS = [
  { id: "ALL", label: "All Jobs" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "ACTIVE", label: "Active / Live" },
  { id: "COMPLETED", label: "Completed" },
];

export default function ProviderJobManagementDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [providerId, setProviderId] = useState(getSelectedProviderId());

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const data = await getProviderJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [providerId]);

  const upcoming = jobs.filter(isUpcoming);
  const active = jobs.filter(isActive);
  const completed = jobs.filter((job) => job.status === "COMPLETED");
  const monthEarnings = completed.reduce((sum, job) => sum + Number(job.netPayout || 0), 0);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesTab =
        tab === "ALL" ||
        (tab === "UPCOMING" && isUpcoming(job)) ||
        (tab === "ACTIVE" && isActive(job)) ||
        (tab === "COMPLETED" && job.status === "COMPLETED");
      const haystack = [job.publicCode, job.bookingCode, job.serviceTitle, job.customerName, job.address, job.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesTab && (!needle || haystack.includes(needle));
    });
  }, [jobs, tab, query]);

  const todayJobs = visible.filter(
    (job) => job.status !== "COMPLETED" && (isSameDay(job.scheduledStart) || isActive(job)),
  );
  const schedule = todayJobs.length ? todayJobs : visible.filter((job) => job.status !== "COMPLETED").slice(0, 6);
  const bars = weekRevenue(jobs);
  const todayDistance = jobs
    .filter((job) => isSameDay(job.scheduledStart) || isActive(job))
    .reduce((sum, job) => sum + Number(job.distanceKm || 0), 0);

  async function onAccept(job) {
    setBusyId(job.id);
    setError("");
    try {
      await acceptProviderJob(job.id);
      await loadJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function onStart(job) {
    setBusyId(job.id);
    setError("");
    try {
      await startProviderJob(job.id);
      await loadJobs();
      navigate(`/provider/jobs/${job.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="pj-page">
      <header className="pj-header">
        <div>
          <h1 className="cc-h1">Provider Job Management</h1>
          <p className="pj-kicker">Manage active field bookings, upcoming schedule, and job lifecycle.</p>
        </div>
        <div className="pj-header__actions">
          <span className="pj-month">
            <CalendarDays size={16} aria-hidden="true" />
            {new Intl.DateTimeFormat("en-LK", { month: "short", year: "numeric" }).format(new Date())} · This Month
          </span>
          <Button leftIcon={<Plus size={16} />} onClick={() => setError("Custom jobs and quotes are not part of this module.")}>
            New Custom Job / Quote
          </Button>
        </div>
      </header>

      {error ? <div className="pj-alert" role="alert">{error}</div> : null}

      <div className="pj-stats">
        <article className="pj-stat">
          <div>
            <dt>Upcoming Bookings</dt>
            <dd>{upcoming.length}</dd>
            <p>+ new requests in queue</p>
          </div>
          <span className="pj-stat__icon"><CalendarDays size={18} /></span>
        </article>
        <article className="pj-stat">
          <div>
            <dt>Active in Progress</dt>
            <dd>{active.length}</dd>
            <p className="pj-live">Live field operations active</p>
          </div>
          <span className="pj-stat__icon"><UserRound size={18} /></span>
        </article>
        <article className="pj-stat">
          <div>
            <dt>Completed (This Month)</dt>
            <dd>{completed.length}</dd>
            <p>Closed work orders</p>
          </div>
          <span className="pj-stat__icon"><CheckCircle2 size={18} /></span>
        </article>
        <article className="pj-stat pj-stat--earnings">
          <div>
            <dt>Month Earnings / Net</dt>
            <dd>LKR {formatLkrCompact(monthEarnings)}</dd>
            <p>Escrow Protected</p>
          </div>
          <span className="pj-stat__icon"><CircleDollarSign size={18} /></span>
        </article>
      </div>

      <div className="pj-toolbar">
        <div className="pj-tabs" role="tablist" aria-label="Job status filters">
          {TABS.map((item) => {
            const count =
              item.id === "ALL"
                ? jobs.length
                : item.id === "UPCOMING"
                  ? upcoming.length
                  : item.id === "ACTIVE"
                    ? active.length
                    : completed.length;
            return (
              <button
                key={item.id}
                className={`pj-tab${tab === item.id ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                <span className="pj-tab__count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="pj-search">
          <SearchInput
            aria-label="Search by job ID, client, location"
            placeholder="Search by job ID, client, location..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="pj-layout">
        <div>
          <section className="pj-panel">
            <div className="pj-panel__head">
              <h2>Today&apos;s Field Schedule</h2>
              <span className="pj-live">Shift Active</span>
            </div>
            <p className="pj-muted" style={{ marginTop: "-0.4rem", marginBottom: "0.8rem" }}>
              {schedule.length} assignment{schedule.length === 1 ? "" : "s"} allocated
            </p>
            {loading ? (
              <Spinner label="Loading jobs" />
            ) : schedule.length === 0 ? (
              <EmptyState title="No jobs in this view" description="Assigned jobs for this provider will appear here." />
            ) : (
              schedule.map((job) => (
                <article key={job.id} className={`pj-job pj-job--${job.status === "IN_PROGRESS" ? "progress" : job.status === "PLACED" ? "placed" : "accepted"}`}>
                  <div className="pj-job__top">
                    <Avatar fallback={initials(job.customerName)} size="lg" />
                    <div className="pj-job__copy">
                      <h3>
                        {job.serviceTitle}{" "}
                        <span className={`pj-chip ${job.status === "IN_PROGRESS" ? "pj-chip--green" : job.status === "PLACED" ? "pj-chip--orange" : "pj-chip--blue"}`}>
                          {job.status === "ACCEPTED" && job.etaMinutes
                            ? `En Route • ETA ${job.etaMinutes} mins`
                            : statusLabel(job.status)}
                        </span>
                      </h3>
                      <div className="pj-job__meta">
                        <span>{job.customerName}</span>
                        <span>{job.address}</span>
                        <span>ID #{job.bookingCode || job.publicCode}</span>
                      </div>
                    </div>
                    <div className="pj-job__pay">
                      <strong>{formatLkr(job.netPayout)}</strong>
                      <span className="pj-chip pj-chip--muted">{paymentLabel(job.paymentHold)}</span>
                    </div>
                  </div>

                  {job.status === "IN_PROGRESS" ? (
                    <div className="pj-progress">
                      <span>
                        {job.progressLabel || "In progress"} ({job.progressPercent || 0}%)
                      </span>
                      <div className="pj-progress__bar" aria-hidden="true">
                        <i style={{ width: `${job.progressPercent || 10}%` }} />
                      </div>
                      <span>{elapsedLabel(job.startedAt)}</span>
                    </div>
                  ) : null}

                  {job.transitNote ? (
                    <div className="pj-note">
                      <span>
                        <MapPin size={14} /> {job.distanceKm ? `${job.distanceKm} km remaining · ` : ""}
                        {job.transitNote}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => window.open(mapsUrl(job), "_blank", "noreferrer")}>
                        Open Navigation
                      </Button>
                    </div>
                  ) : null}

                  {job.status === "PLACED" ? (
                    <div className="pj-note">
                      <span>Requested start is on the current schedule. Confirm this booking to lock the slot.</span>
                    </div>
                  ) : null}

                  <div className="pj-job__actions">
                    {job.customerPhone ? (
                      <Button variant="outline" size="sm" leftIcon={<Phone size={14} />} onClick={() => window.open(`tel:${job.customerPhone}`)}>
                        Call Client
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/provider/jobs/${job.id}`)}>
                      {job.status === "PLACED" ? "Inspect Notes" : "View Job Details"}
                    </Button>
                    {job.status === "PLACED" ? (
                      <Button size="sm" loading={busyId === job.id} onClick={() => onAccept(job)}>
                        Accept Booking
                      </Button>
                    ) : null}
                    {job.status === "ACCEPTED" ? (
                      <Button size="sm" loading={busyId === job.id} onClick={() => onStart(job)}>
                        Tap on Arrival
                      </Button>
                    ) : null}
                    {job.status === "IN_PROGRESS" ? (
                      <Button size="sm" onClick={() => navigate(`/provider/jobs/${job.id}`)}>
                        Mark Complete
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="pj-panel pj-chart">
            <div className="pj-panel__head">
              <h2>Weekly Revenue & Completed Work Orders</h2>
              <span className="pj-muted">HVAC Work · Electrical</span>
            </div>
            <p className="pj-muted">Aggregated job net payouts for the past 7 days</p>
            <div className="pj-bars">
              {bars.map((day) => (
                <div key={day.label} className="pj-bars__col">
                  <div className="pj-bars__stack">
                    <i className="hvac" style={{ height: `${Math.max(8, (day.hvac / day.max) * 100)}%` }} />
                    <i className="elec" style={{ height: `${Math.max(8, (day.electrical / day.max) * 100)}%` }} />
                  </div>
                  <span>{day.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="pj-side">
          <section className="pj-side-card">
            <div className="pj-side-card__head">
              <h2>Dispatch & Matching</h2>
              <span className="pj-chip pj-chip--green">Active</span>
            </div>
            <div className="pj-toggle">
              <span>Instant Auto-Dispatch<br /><small>Accept urgent leads automatically</small></span>
              <button className="pj-switch" type="button" aria-pressed={autoDispatch} onClick={() => setAutoDispatch((value) => !value)}>
                <span />
              </button>
            </div>
            <div className="pj-metrics">
              <div><span>Operating Service Radius</span><strong>10 km</strong></div>
              <div><span>Today&apos;s Distance Covered</span><strong>{todayDistance.toFixed(1)} km</strong></div>
              <div><span>Jobs in current shift</span><strong>{schedule.length}</strong></div>
            </div>
          </section>

          <section className="pj-side-card">
            <div className="pj-side-card__head">
              <h2>Schedule Timeline</h2>
              <span className="pj-muted">Today</span>
            </div>
            <div className="pj-week" aria-hidden="true">
              {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
                <button key={`${label}-${index}`} className={index === (new Date().getDay() + 6) % 7 ? "is-today" : ""} type="button">
                  {label}
                </button>
              ))}
            </div>
            {jobs
              .filter((job) => job.scheduledStart && job.status !== "COMPLETED")
              .slice(0, 4)
              .map((job) => (
                <div key={job.id} className="pj-slot">
                  <time>
                    {new Intl.DateTimeFormat("en-LK", { hour: "2-digit", minute: "2-digit" }).format(new Date(job.scheduledStart))}
                  </time>
                  <div>
                    <strong>{job.serviceTitle}</strong>
                    <div className="pj-muted">{job.city || job.address}</div>
                  </div>
                </div>
              ))}
          </section>

          <section className="pj-side-card">
            <h2>Provider Live Hotline</h2>
            <p className="pj-muted">24/7 Operations Command Center</p>
            <p>Encountered an on-site dispute, dangerous electrical hazard, or customer cancellation mid-transit?</p>
            <div className="pj-hotline">
              <Button variant="outline" size="sm">Live Chat</Button>
              <Button variant="danger" size="sm" leftIcon={<Siren size={14} />}>Emergency SOS</Button>
            </div>
          </section>

          <section className="pj-side-card pj-lead">
            <p>NEW LEAD IN YOUR AREA</p>
            <h2>Keep the current bookings moving</h2>
            <p>Use Accept Booking on placed jobs in your queue. Ownership is enforced for this provider only.</p>
          </section>
        </aside>
      </div>

      <div className="pj-identity">
        <BriefcaseBusiness size={14} />
        Demo provider identity
        <select
          aria-label="Demo provider identity"
          value={providerId}
          onChange={(event) => {
            setDemoProvider(event.target.value);
            setProviderId(event.target.value);
          }}
        >
          <option value="provider-a">Kavinda Silva (provider-a)</option>
          <option value="provider-b">Provider B</option>
        </select>
        <Link to="/provider/jobs">Refresh</Link>
      </div>
    </section>
  );
}
