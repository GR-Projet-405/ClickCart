import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Download,
  Flag,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import {
  completeProviderJob,
  fetchProofObjectUrl,
  getProviderJobById,
  startProviderJob,
  uploadCompletionProof,
} from "../../services/providerJobService";
import {
  durationClock,
  fileSizeLabel,
  formatDateTime,
  formatLkr,
  formatWhen,
  initials,
  lifecycleIndex,
  mapsUrl,
  osmEmbed,
  paymentLabel,
  statusLabel,
} from "./jobUi";
import "./providerJobs.css";

const STEPS = [
  { n: 1, title: "Placed & Paid", hint: "Card escrow" },
  { n: 2, title: "Accepted by Pro", hint: "Confirmed" },
  { n: 3, title: "In Progress", hint: "Servicing & coils check" },
  { n: 4, title: "Complete & Release", hint: "Pending sign-off" },
];

export default function ProviderJobDetailsConsole() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [proofUrls, setProofUrls] = useState({});
  const [clock, setClock] = useState("00:00:00");

  async function loadJob() {
    setLoading(true);
    setError("");
    try {
      const data = await getProviderJobById(jobId);
      setJob(data);
    } catch (err) {
      setError(err.message || "Unable to load this job");
      setJob(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJob();
  }, [jobId]);

  useEffect(() => {
    if (!job?.startedAt || job.status !== "IN_PROGRESS") {
      return undefined;
    }
    const tick = () => setClock(durationClock(job.startedAt));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [job]);

  useEffect(() => {
    let cancelled = false;
    const urls = [];
    async function hydratePhotos() {
      if (!job?.photos?.length) {
        setProofUrls({});
        return;
      }
      const next = {};
      for (const photo of job.photos) {
        try {
          const url = await fetchProofObjectUrl(job.id, photo.id);
          urls.push(url);
          next[photo.id] = url;
        } catch {
          next[photo.id] = "";
        }
      }
      if (!cancelled) {
        setProofUrls(next);
      }
    }
    hydratePhotos();
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [job]);

  const step = lifecycleIndex(job?.status);
  const canComplete = job?.status === "IN_PROGRESS";
  const canStart = job?.status === "ACCEPTED";
  const canUpload = job?.status === "IN_PROGRESS";

  async function onStart() {
    setBusy("start");
    setError("");
    try {
      setJob(await startProviderJob(job.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function onUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type) && !/\.(jpe?g|png)$/i.test(file.name)) {
      setError("Only JPEG or PNG images are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be 10MB or smaller");
      return;
    }
    setBusy("upload");
    setError("");
    try {
      setJob(await uploadCompletionProof(job.id, file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function onComplete() {
    if (!canComplete) {
      setError("Only in-progress jobs can be marked complete");
      return;
    }
    if (!job.photos?.length) {
      setError("Upload at least one photographic proof before completing the job");
      return;
    }
    setBusy("complete");
    setError("");
    try {
      setJob(await completeProviderJob(job.id, job.completionNotes));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const scheduledWindow = useMemo(() => {
    if (!job?.scheduledStart) {
      return "Not scheduled";
    }
    const day = new Intl.DateTimeFormat("en-LK", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(job.scheduledStart));
    return `${day}  ${formatWhen(job.scheduledStart)} – ${formatWhen(job.scheduledEnd) || ""}`;
  }, [job]);

  if (loading) {
    return (
      <section className="pj-page pj-page--details">
        <Spinner label="Loading job details" />
      </section>
    );
  }

  if (!job) {
    return (
      <section className="pj-page pj-page--details">
        {error ? <div className="pj-alert" role="alert">{error}</div> : null}
        <EmptyState
          title="Job not available"
          description="This job was not found or you are not authorized to view it."
          action={<Button onClick={() => navigate("/provider/jobs")}>Back to My Jobs</Button>}
        />
      </section>
    );
  }

  return (
    <section className="pj-page pj-page--details">
      <nav className="pj-crumb" aria-label="Breadcrumb">
        <Link to="/provider/jobs">My Jobs</Link>
        <span>/</span>
        <span>{job.status === "COMPLETED" ? "Completed" : "Active Ongoing"}</span>
        <span>/</span>
        <strong>Booking #{job.publicCode}</strong>
      </nav>

      <div className="pj-title-row">
        <div>
          <div className="pj-window">Service Window {job.status === "IN_PROGRESS" ? "Active" : statusLabel(job.status)}</div>
          <h1>{job.serviceTitle}</h1>
          <p className="pj-subline">
            {job.packageName || "Residential service"}
            {job.bookingCode ? ` · ${job.bookingCode}` : ""}
          </p>
          <div className="pj-job__meta" style={{ marginTop: "0.55rem" }}>
            <span className={`pj-chip ${job.status === "IN_PROGRESS" ? "pj-chip--green" : "pj-chip--blue"}`}>
              {statusLabel(job.status)}
            </span>
            <span className="pj-chip pj-chip--muted">{paymentLabel(job.paymentHold)}</span>
          </div>
        </div>
        <div className="pj-header__actions">
          <Button variant="outline" size="sm" leftIcon={<Flag size={14} />} onClick={() => setError("Issue reporting is handled in another module.")}>
            Report Issue
          </Button>
          {job.customerPhone ? (
            <Button variant="outline" size="sm" leftIcon={<Phone size={14} />} onClick={() => window.open(`tel:${job.customerPhone}`)}>
              Call Client
            </Button>
          ) : null}
          <Button variant="outline" size="sm" leftIcon={<MessageSquare size={14} />}>
            Chat
          </Button>
          {canStart ? (
            <Button loading={busy === "start"} onClick={onStart}>
              Start Job
            </Button>
          ) : (
            <Button loading={busy === "complete"} disabled={!canComplete} onClick={onComplete}>
              Mark Job as Complete
            </Button>
          )}
        </div>
      </div>

      {error ? <div className="pj-alert" role="alert">{error}</div> : null}

      <section className="pj-panel pj-lifecycle">
        <div className="pj-panel__head">
          <h2>Service Lifecycle Stage</h2>
          <span className="pj-chip pj-chip--muted">{job.slaLabel || "Standard Residential SLA"}</span>
        </div>
        <div className="pj-steps">
          {STEPS.map((item) => {
            const state = item.n < step ? "is-done" : item.n === step ? "is-current" : "";
            return (
              <article key={item.n} className={`pj-step ${state}`}>
                <span className="pj-step__mark">{item.n < step ? <Check size={12} /> : item.n}</span>
                <div>
                  <strong>
                    {item.n}. {item.title}
                  </strong>
                  <div className="pj-muted">
                    {item.n === 1 && job.placedAt ? formatDateTime(job.placedAt) : item.n === 2 && job.acceptedAt ? formatDateTime(job.acceptedAt) : item.hint}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="pj-detail-grid">
        <div>
          <section className="pj-panel">
            <div className="pj-panel__head">
              <h2>Client & Service Location</h2>
              <span className="pj-muted">Client ID: {job.customerId || "—"}</span>
            </div>
            <div className="pj-client">
              <Avatar fallback={initials(job.customerName)} size="lg" src={job.customerAvatarUrl} />
              <div>
                <strong>{job.customerName}</strong>
                {job.customerVerified ? (
                  <span className="pj-chip pj-chip--green" style={{ marginLeft: "0.4rem" }}>
                    <BadgeCheck size={12} /> Verified Homeowner
                  </span>
                ) : null}
                <div className="pj-client__facts">
                  {job.customerRating ? <span>{job.customerRating} Rating</span> : null}
                  {job.customerPreviousBookings ? <span>{job.customerPreviousBookings} previous bookings</span> : null}
                  {job.customerMemberArea ? <span>{job.customerMemberArea}</span> : null}
                  {job.customerPhone ? <span>{job.customerPhone}</span> : null}
                </div>
              </div>
            </div>
            {job.accessInstructions ? (
              <div className="pj-callout">
                <strong>CLIENT INSTRUCTIONS & GATE ACCESS</strong>
                <p>{job.accessInstructions}</p>
              </div>
            ) : null}
            <p style={{ display: "flex", gap: "0.4rem", alignItems: "center", margin: "0.85rem 0 0" }}>
              <MapPin size={16} /> {job.address}
              {job.distanceKm ? <span className="pj-muted">{job.distanceKm} km away</span> : null}
            </p>
            <div className="pj-map">
              <iframe title="Job location map" src={osmEmbed(job)} />
              <div className="pj-map__foot">
                <span>Location verified for this booking</span>
                <Button variant="outline" size="sm" leftIcon={<Navigation size={14} />} onClick={() => window.open(mapsUrl(job), "_blank", "noreferrer")}>
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </section>

          <section className="pj-panel" style={{ marginTop: "1rem" }}>
            <div className="pj-panel__head">
              <h2>Service Diagnostics & Included Scope</h2>
              {job.packageName ? <span className="pj-chip pj-chip--green">{job.packageName}</span> : null}
            </div>
            {job.diagnostics?.length ? (
              <div className="pj-diag">
                {job.diagnostics.map((item) => (
                  <article key={item.title}>
                    <h3>
                      <ShieldCheck size={14} color="#12b76a" /> {item.title}
                    </h3>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="pj-muted">No diagnostic details were recorded for this job.</p>
            )}
          </section>

          <section className="pj-panel" style={{ marginTop: "1rem" }}>
            <div className="pj-panel__head">
              <h2>Job Verification & Photographic Proof</h2>
              <span className="pj-muted">{job.photos?.length || 0} of 8 photos attached</span>
            </div>
            <p className="pj-muted">Required by ClickCart Escrow Guarantee before trigger sign-off.</p>
            <div className="pj-photos">
              {job.photos?.map((photo) => (
                <figure key={photo.id} className="pj-photo">
                  {proofUrls[photo.id] ? <img src={proofUrls[photo.id]} alt={photo.originalName} /> : <div className="pj-upload">Loading photo…</div>}
                  <figcaption>
                    {photo.originalName}
                    <div>{fileSizeLabel(photo.sizeBytes)}</div>
                  </figcaption>
                </figure>
              ))}
              {canUpload ? (
                <label className="pj-upload">
                  <Upload size={18} />
                  <strong>Upload Photo Proof</strong>
                  <span>JPEG or PNG up to 10MB</span>
                  <input type="file" accept="image/png,image/jpeg" onChange={onUpload} disabled={busy === "upload"} />
                </label>
              ) : null}
            </div>
            {job.checklist?.length ? (
              <div className="pj-check">
                {job.checklist.map((item) => (
                  <div key={item}>
                    <Check size={14} color="#12b76a" /> {item}
                  </div>
                ))}
              </div>
            ) : null}
            {job.completionNotes ? (
              <div>
                <h3 className="cc-h4" style={{ marginTop: "1rem" }}>Provider Completion Notes</h3>
                <p className="pj-notes">{job.completionNotes}</p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="pj-side">
          <section className="pj-side-card">
            <div className="pj-side-card__head">
              <h2>Earnings Summary</h2>
              <span className="pj-chip pj-chip--green">Guaranteed</span>
            </div>
            <div className="pj-earn">
              <div className="row"><span>Service Base Fee</span><strong>{formatLkr(job.serviceBaseFee)}</strong></div>
              <div className="row"><span>Estimated Parts / Gas Top-up</span><strong>+ {formatLkr(job.partsTopUp)}</strong></div>
              <div className="row"><span>Platform Commission (10%)</span><strong>- {formatLkr(job.platformCommission)}</strong></div>
            </div>
            <div className="pj-net">
              NET PROVIDER PAYOUT
              <strong>{formatLkr(job.netPayout)}</strong>
            </div>
            <p className="pj-muted">{paymentLabel(job.paymentHold)}. Funds follow the existing payout process after client sign-off.</p>
          </section>

          <section className="pj-side-card">
            <div className="pj-side-card__head">
              <h2>Schedule & Timers</h2>
              <CalendarDays size={16} />
            </div>
            <p className="pj-muted">SCHEDULED WINDOW</p>
            <p><strong>{scheduledWindow}</strong></p>
            <p className="pj-muted" style={{ marginTop: "0.8rem" }}>Duration on Site</p>
            <div className="pj-timer">{job.status === "IN_PROGRESS" ? clock : job.status === "COMPLETED" ? "Completed" : "Not started"}</div>
          </section>

          <section className="pj-side-card">
            <h2>Workflow Action Center</h2>
            <div className="pj-job__actions" style={{ marginTop: "0.75rem", flexDirection: "column" }}>
              <Button disabled={!canComplete} loading={busy === "complete"} onClick={onComplete}>
                Complete & Trigger Customer Sign-off
              </Button>
              <Button variant="outline" leftIcon={<Download size={14} />} onClick={() => window.print()}>
                Download Work Order PDF
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
