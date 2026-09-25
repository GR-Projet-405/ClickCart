import { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import EmptyState from "../../../components/common/EmptyState";
import PageContainer from "../../../components/common/PageContainer";
import "./BookingApprovalPage.css";

const SAMPLE_REQUESTS = [
  {
    id: "bk-1",
    initials: "HC",
    tone: "green",
    serviceName: "House Cleaning",
    isNew: true,
    customerName: "Gihani Perera",
    location: "Colombo 05",
    whenLabel: "Mar 20, 2024 (09:00 AM)",
    createdAt: "2024-03-20T09:00:00",
  },
  {
    id: "bk-2",
    initials: "AC",
    tone: "blue",
    serviceName: "AC Repair & Service",
    isNew: true,
    customerName: "Kasun Rajapaksha",
    location: "Dehiwala",
    whenLabel: "Mar 21, 2024 (02:00 PM)",
    createdAt: "2024-03-21T14:00:00",
  },
  {
    id: "bk-3",
    initials: "PL",
    tone: "green",
    serviceName: "Plumbing Repair",
    isNew: false,
    customerName: "Nimal Silva",
    location: "Nugegoda",
    whenLabel: "Mar 22, 2024 (11:00 AM)",
    createdAt: "2024-03-22T11:00:00",
  },
];

export default function BookingApprovalPage() {
  const [requests] = useState(SAMPLE_REQUESTS);
  const [selectedId, setSelectedId] = useState(SAMPLE_REQUESTS[0].id);
  const [sort, setSort] = useState("newest");

  const sortedRequests = [...requests].sort((a, b) =>
    sort === "newest"
      ? b.createdAt.localeCompare(a.createdAt)
      : a.createdAt.localeCompare(b.createdAt),
  );

  return (
    <PageContainer className="booking-approval">
      <header className="booking-approval__header">
        <h1>Booking Approval</h1>
        <p>Manage incoming client requests and service schedules</p>
      </header>

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

        {sortedRequests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="New client requests will appear here for approval."
          />
        ) : (
          <ul className="booking-approval__list">
            {sortedRequests.map((request) => {
              const selected = request.id === selectedId;
              return (
                <li key={request.id}>
                  <article
                    className={`booking-approval__request${
                      selected ? " is-selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="booking-approval__select"
                      aria-pressed={selected}
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
                        onClick={() => setSelectedId(request.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedId(request.id)}
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
    </PageContainer>
  );
}