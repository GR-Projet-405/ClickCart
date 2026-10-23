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
import CreateCustomJobModal from "./CreateCustomJobModal";
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
  const [timelineSourceJobs, setTimelineSourceJobs] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [showCustomJobModal, setShowCustomJobModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedTimelineDate, setSelectedTimelineDate] = useState(() => new Date());

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      const data = await getProviderJobs(null, year, month);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [selectedMonth]);

  useEffect(() => {
    let isMounted = true;
    const monday = new Date(selectedTimelineDate);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const months = new Map(
      [monday, sunday].map((date) => [`${date.getFullYear()}-${date.getMonth() + 1}`, date]),
    );

    Promise.all(
      [...months.values()].map((date) =>
        getProviderJobs(null, date.getFullYear(), date.getMonth() + 1),
      ),
    )
      .then((monthJobs) => {
        if (isMounted) {
          const uniqueJobs = new Map(monthJobs.flat().map((job) => [job.id, job]));
          setTimelineSourceJobs([...uniqueJobs.values()]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTimelineSourceJobs([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTimelineDate]);

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
  const weekDates = useMemo(() => {
    const monday = new Date(selectedTimelineDate);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [selectedTimelineDate]);
  const timelineJobs = timelineSourceJobs
    .filter((job) => job.scheduledStart && job.status !== "COMPLETED" && isSameDay(job.scheduledStart, selectedTimelineDate))
    .sort((first, second) => new Date(first.scheduledStart) - new Date(second.scheduledStart));

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
          <div className="pj-month-selector">
            <CalendarDays size={16} aria-hidden="true" />
            <input
              type="month"
              value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month] = e.target.value.split('-').map(Number);
                  setSelectedMonth(new Date(year, month - 1, 1));
                }
              }}
              className="pj-month-input"
            />
          </div>
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowCustomJobModal(true)}>
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
              <h2>Service coverage</h2>
            </div>
            <p>Manage where customers can book your services.</p>
            <button type="button" onClick={() => navigate("/provider/service-areas")}>Manage service areas</button>
            <div className="pj-metrics">

              <div><span>Today&apos;s Distance Covered</span><strong>{todayDistance.toFixed(1)} km</strong></div>
              <div><span>Jobs in current shift</span><strong>{schedule.length}</strong></div>
            </div>
          </section>

          <section className="pj-side-card">
            <div className="pj-side-card__head">
              <h2>Schedule Timeline</h2>
              <span className="pj-muted">
                {new Intl.DateTimeFormat("en-LK", { weekday: "short", day: "numeric", month: "short" }).format(selectedTimelineDate)}
              </span>
            </div>
            <div className="pj-week" role="group" aria-label="Choose a day for the schedule">
              {weekDates.map((date) => {
                const isToday = isSameDay(date.toISOString());
                const isSelected = isSameDay(date.toISOString(), selectedTimelineDate);
                return (
                  <button
                    key={date.toISOString()}
                    className={`${isToday ? "is-today" : ""}${isSelected ? " is-selected" : ""}`}
                    type="button"
                    aria-label={new Intl.DateTimeFormat("en-LK", { weekday: "long", day: "numeric", month: "long" }).format(date)}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedTimelineDate(date)}
                  >
                    {new Intl.DateTimeFormat("en-LK", { weekday: "narrow" }).format(date)}
                  </button>
                );
              })}
            </div>
            {timelineJobs.length ? timelineJobs.map((job) => (
                <button
                  key={job.id}
                  className="pj-slot"
                  type="button"
                  onClick={() => navigate(`/provider/jobs/${job.id}`)}
                  aria-label={`View ${job.serviceTitle} job details`}
                >
                  <time>
                    {new Intl.DateTimeFormat("en-LK", { hour: "2-digit", minute: "2-digit" }).format(new Date(job.scheduledStart))}
                  </time>
                  <div>
                    <strong>{job.serviceTitle}</strong>
                    <div className="pj-muted">{job.city || job.address}</div>
                  </div>
                </button>
              )) : <p className="pj-muted pj-empty-day">No scheduled jobs for this day.</p>}
          </section>

          <section className="pj-side-card">
            <h2>Provider Support</h2>
            <p>Need help with a booking or customer issue?</p>
            <div className="pj-hotline">
              <Button variant="outline" size="sm" onClick={() => navigate("/provider/messages")}>Live Chat</Button>
            </div>
          </section>

          <section className="pj-side-card pj-lead">
            <p>NEW LEAD IN YOUR AREA</p>
            <h2>Keep the current bookings moving</h2>
            <p>Use Accept Booking on placed jobs in your queue. Ownership is enforced for this provider only.</p>
          </section>
        </aside>
      </div>

      <CreateCustomJobModal
        open={showCustomJobModal}
        onClose={() => setShowCustomJobModal(false)}
        onSuccess={() => loadJobs()}
      />

    </section>
  );
}
