import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import EmptyState from "../../../components/common/EmptyState";
import PageContainer from "../../../components/common/PageContainer";
import { API_BASE_URL } from "../../../config/api";
import "./BookingApprovalPage.css";

const PROVIDER_ID = "provider-1";

function toAmPm(value) {
  const [hourText, minute] = value.split(":");
  let hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
}

function toRequest(booking) {
  const initials = booking.serviceName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const scheduled = new Date(booking.scheduledAt);
  const dateLabel = scheduled.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Colombo",
  });
  const shortDate = scheduled.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Colombo",
  });
  const [start, end] = (booking.timeSlot || "").split("-");
  const timeSlot =
    start && end ? `${toAmPm(start)} – ${toAmPm(end)}` : booking.timeSlot;

  return {
    id: booking.id,
    initials,
    tone: "green",
    serviceName: booking.serviceName,
    isNew: booking.unread,
    customerName: booking.customerName,
    location: booking.city,
    whenLabel: `${shortDate} (${toAmPm(start)})`,
    createdAt: booking.createdAt,
    status: booking.status,
    area: `${booking.city}, ${booking.country}`,
    dateLabel,
    timeSlot,
    payLabel: `${booking.currency} ${Number(booking.estimatedPay).toLocaleString("en-US")}`,
    notes: booking.notes,
  };
}

export default function BookingApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${API_BASE_URL}/provider/bookings?sort=${sort}`,
          { headers: { "X-Provider-Id": PROVIDER_ID } },
        );
        if (!response.ok) {
          throw new Error("Pending requests could not be loaded.");
        }
        const next = (await response.json()).map(toRequest);
        if (ignore) {
          return;
        }
        setRequests(next);
        setSelectedId((current) =>
          next.some((request) => request.id === current)
            ? current
            : (next[0]?.id ?? null),
        );
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [sort]);

  const selected =
    requests.find((request) => request.id === selectedId) ?? null;

  async function decide(requestId, nextStatus) {
    setSelectedId(requestId);
    setDeciding(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/provider/bookings/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Provider-Id": PROVIDER_ID,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "The booking could not be updated.");
      }
      setRequests((current) =>
        current.filter((request) => request.id !== requestId),
      );
      setSelectedId((current) => (current === requestId ? null : current));
    } catch (decideError) {
      setError(decideError.message);
    } finally {
      setDeciding(false);
    }
  }

  return (
    <PageContainer className="booking-approval">
      <header className="booking-approval__header">
        <h1>Booking Approval</h1>
        <p>Manage incoming client requests and service schedules</p>
      </header>

      <div className="booking-approval__workspace">
        <Card className="booking-approval__requests" padding="md">
          <div className="booking-approval__requests-head">
            <h2>
              Pending Requests
              <span className="booking-approval__count">{requests.length}</span>
            </h2>
            <label className="booking-approval__sort">
              Sort:
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </label>
          </div>

          {error && (
            <p
              className="booking-approval__message booking-approval__message--error"
              role="alert"
            >
              {error}
            </p>
          )}

          {loading ? (
            <p className="booking-approval__message">
              Loading pending requests...
            </p>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No pending requests"
              description="New client requests will appear here for approval."
            />
          ) : (
            <ul className="booking-approval__list">
              {requests.map((request) => {
                const isSelected = request.id === selectedId;
                return (
                  <li key={request.id}>
                    <article
                      className={`booking-approval__request${
                        isSelected ? " is-selected" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="booking-approval__select"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedId(request.id)}
                      >
                        <Avatar
                          fallback={request.initials}
                          alt=""
                          size="lg"
                          className={`booking-approval__initials booking-approval__initials--${request.tone}`}
                        />
                        <span className="booking-approval__summary">
                          <span className="booking-approval__title-row">
                            <strong>{request.serviceName}</strong>
                            {request.isNew && (
                              <Badge variant="error">New</Badge>
                            )}
                          </span>
                          <span>{request.customerName}</span>
                          <span className="booking-approval__meta">
                            <MapPin size={14} aria-hidden="true" />
                            {request.location}
                            <Calendar size={14} aria-hidden="true" />
                            {request.whenLabel}
                          </span>
                        </span>
                      </button>
                      <div className="booking-approval__actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deciding}
                          onClick={() => decide(request.id, "DECLINED")}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={deciding}
                          onClick={() => decide(request.id, "ACCEPTED")}
                        >
                          Accept
                        </Button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {selected && (
          <Card className="booking-approval__details" padding="md">
            <div className="booking-approval__details-head">
              <h2>Request Details</h2>
              <Badge className="booking-approval__status" variant="warning">
                {selected.status.replaceAll("_", " ")}
              </Badge>
            </div>

            <p className="booking-approval__profile-label">Customer Profile</p>
            <p className="booking-approval__customer">
              {selected.customerName}
            </p>
            <p className="booking-approval__place">{selected.area}</p>

            <dl className="booking-approval__facts">
              <div>
                <dt>Service:</dt>
                <dd>{selected.serviceName}</dd>
              </div>
              <div>
                <dt>Date:</dt>
                <dd>{selected.dateLabel}</dd>
              </div>
              <div>
                <dt>Time Slot:</dt>
                <dd>{selected.timeSlot}</dd>
              </div>
              <div>
                <dt>Estimated Pay:</dt>
                <dd className="booking-approval__pay">{selected.payLabel}</dd>
              </div>
            </dl>

            <div className="booking-approval__notes">
              <h3>Client Instructions / Notes</h3>
              <blockquote>“{selected.notes}”</blockquote>
            </div>

            <div className="booking-approval__details-actions">
              <Button
                variant="outline"
                disabled={deciding}
                onClick={() => decide(selected.id, "DECLINED")}
              >
                Decline Request
              </Button>
              <Button
                variant="primary"
                disabled={deciding}
                onClick={() => decide(selected.id, "ACCEPTED")}
              >
                Accept Booking
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
