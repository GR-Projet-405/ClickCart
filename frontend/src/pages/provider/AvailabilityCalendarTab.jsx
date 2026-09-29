import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import IconButton from "../../components/common/IconButton";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import useBlockedDates from "../../hooks/useBlockedDates";
import { getAvailabilitySlots } from "../../services/availabilityService";
import { CURRENT_PROVIDER_ID } from "../../config/provider";
import "./AvailabilityCalendarTab.css";

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toIso(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function monthStartIso(year, month) {
  return toIso(year, month, 1);
}

function monthEndIso(year, month) {
  return toIso(year, month, daysInMonth(year, month));
}

function formatWindow(slot) {
  return `${slot.startTime.slice(0, 5)} – ${slot.endTime.slice(0, 5)}`;
}

function compactWindow(slot) {
  return `${slot.startTime.slice(0, 2)}–${slot.endTime.slice(0, 2)}`;
}

export default function AvailabilityCalendarTab() {
  const now = new Date();
  const [view, setView] = useState(() => ({
    year: now.getFullYear(),
    month: now.getMonth(),
  }));
  const [selectedIso, setSelectedIso] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    blockedDates,
    loading: blockedLoading,
    error: blockedError,
    refresh: refreshBlocked,
  } = useBlockedDates();

  const startDate = monthStartIso(view.year, view.month);
  const endDate = monthEndIso(view.year, view.month);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const data = await getAvailabilitySlots(
          CURRENT_PROVIDER_ID,
          startDate,
          endDate
        );
        if (!controller.signal.aborted) {
          setSlots(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setSlotsError(err);
          setSlots([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [startDate, endDate, refreshKey]);

  const slotsByDate = useMemo(() => {
    const map = {};
    for (const slot of slots) {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [slots]);

  const blockedRanges = useMemo(
    () =>
      (blockedDates || []).filter((bd) => bd && bd.startDate && bd.endDate),
    [blockedDates]
  );

  function findBlocked(iso) {
    return (
      blockedRanges.find((bd) => iso >= bd.startDate && iso <= bd.endDate) ||
      null
    );
  }

  const busy = slotsLoading || blockedLoading;
  const loadError = slotsError || blockedError;
  const hasSlots = slots.length > 0;
  const showFullError = Boolean(loadError) && !busy && !hasSlots;

  function goPrevMonth() {
    setView((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { year: v.year, month: v.month - 1 }
    );
    setSelectedIso(null);
  }

  function goNextMonth() {
    setView((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { year: v.year, month: v.month + 1 }
    );
    setSelectedIso(null);
  }

  function goToday() {
    const d = new Date();
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelectedIso(toIso(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  function retry() {
    setRefreshKey((k) => k + 1);
    if (blockedError) {
      refreshBlocked();
    }
  }

  function describeDay(iso) {
    const blocked = findBlocked(iso);
    const daySlots = slotsByDate[iso] || [];
    if (blocked) return "blocked";
    if (daySlots.length > 0) {
      return daySlots.length === 1
        ? `available ${formatWindow(daySlots[0])}`
        : `available, ${daySlots.length} windows`;
    }
    return "no availability";
  }

  const year = view.year;
  const month = view.month;
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const trailingBlanks =
    (7 - ((leadingBlanks + totalDays) % 7)) % 7;

  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

  let selectedDetail = null;
  if (selectedIso) {
    const selYear = Number(selectedIso.slice(0, 4));
    const selMonth = Number(selectedIso.slice(5, 7)) - 1;
    const selDay = Number(selectedIso.slice(8, 10));
    const selDate = new Date(selYear, selMonth, selDay);
    selectedDetail = {
      iso: selectedIso,
      label: `${WEEKDAYS_FULL[selDate.getDay()]}, ${MONTHS_FULL[selMonth]} ${selDay}, ${selYear}`,
      blocked: findBlocked(selectedIso),
      daySlots: slotsByDate[selectedIso] || [],
    };
  }

  return (
    <div style={{ display: "grid", gap: "var(--cc-space-5)" }}>
      <header>
        <h1 className="cc-h1">Availability Calendar</h1>
        <p
          className="cc-body-sm cc-text-secondary"
          style={{ margin: "var(--cc-space-1) 0 0" }}
        >
          A monthly overview of your working hours and blocked dates.
        </p>
      </header>

      {showFullError && (
        <div
          role="alert"
          style={{
            display: "grid",
            justifyItems: "center",
            gap: "var(--cc-space-3)",
            textAlign: "center",
            padding: "var(--cc-space-8)",
            borderRadius: "var(--cc-radius-xl)",
            background: "var(--cc-error-soft)",
            color: "var(--cc-error-text)",
          }}
        >
          <AlertTriangle size={24} aria-hidden="true" />
          <strong>Couldn&apos;t load the calendar</strong>
          <p style={{ margin: 0 }}>
            {loadError.message || "Something went wrong."}
          </p>
          <Button variant="outline" size="sm" onClick={retry}>
            Try Again
          </Button>
        </div>
      )}

      {!showFullError && (
        <Card padding="md">
          <div className="cc-cal">
            <div className="cc-cal__toolbar">
              <h2 className="cc-cal__title">
                {MONTHS_FULL[month]} {year}
              </h2>
              <div className="cc-cal__nav">
                <IconButton
                  icon={<ChevronLeft size={18} />}
                  label="Previous month"
                  size="sm"
                  onClick={goPrevMonth}
                />
                <Button variant="outline" size="sm" onClick={goToday}>
                  Today
                </Button>
                <IconButton
                  icon={<ChevronRight size={18} />}
                  label="Next month"
                  size="sm"
                  onClick={goNextMonth}
                />
              </div>
            </div>

            {loadError && hasSlots && !busy && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--cc-space-3)",
                  flexWrap: "wrap",
                  padding: "var(--cc-space-3) var(--cc-space-4)",
                  borderRadius: "var(--cc-radius-lg)",
                  background: "var(--cc-error-soft)",
                  color: "var(--cc-error-text)",
                  fontSize: "var(--cc-text-body-sm-size)",
                }}
              >
                <AlertTriangle
                  size={16}
                  aria-hidden="true"
                  style={{ flex: "none" }}
                />
                <span style={{ flex: "1", minWidth: "10rem" }}>
                  {loadError.message || "Something went wrong."}
                </span>
                <Button variant="outline" size="sm" onClick={retry}>
                  Retry
                </Button>
              </div>
            )}

            {busy ? (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  padding: "var(--cc-space-10)",
                }}
              >
                <Spinner size="lg" label="Loading calendar" />
              </div>
            ) : (
              <>
                <div className="cc-cal__weekdays" aria-hidden="true">
                  {WEEKDAY_SHORT.map((label) => (
                    <span key={label} className="cc-cal__weekday">
                      {label}
                    </span>
                  ))}
                </div>

                <div className="cc-cal__grid" role="group" aria-label={`${MONTHS_FULL[month]} ${year}`}>
                  {Array.from({ length: leadingBlanks }, (_, i) => (
                    <span
                      key={`blank-start-${i}`}
                      className="cc-cal__cell cc-cal__cell--empty"
                      aria-hidden="true"
                    />
                  ))}

                  {Array.from({ length: totalDays }, (_, i) => {
                    const day = i + 1;
                    const iso = toIso(year, month, day);
                    const blocked = Boolean(findBlocked(iso));
                    const daySlots = slotsByDate[iso] || [];
                    const state = blocked
                      ? "blocked"
                      : daySlots.length > 0
                        ? "available"
                        : "none";
                    const isToday = iso === todayIso;
                    const isSelected = iso === selectedIso;

                    return (
                      <button
                        key={iso}
                        type="button"
                        className={[
                          "cc-cal__cell",
                          `cc-cal__cell--${state}`,
                          isToday ? "cc-cal__cell--today" : "",
                          isSelected ? "cc-cal__cell--selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-label={`${MONTHS_FULL[month]} ${day}, ${describeDay(iso)}${isToday ? ", today" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setSelectedIso((prev) => (prev === iso ? null : iso))
                        }
                      >
                        <span className="cc-cal__day">{day}</span>
                        {state === "available" && (
                          <span className="cc-cal__hint">
                            {daySlots.length === 1
                              ? compactWindow(daySlots[0])
                              : `${daySlots.length}×`}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {Array.from({ length: trailingBlanks }, (_, i) => (
                    <span
                      key={`blank-end-${i}`}
                      className="cc-cal__cell cc-cal__cell--empty"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <div className="cc-cal__legend">
                  <span className="cc-cal__legend-item">
                    <span
                      className="cc-cal__swatch cc-cal__swatch--available"
                      aria-hidden="true"
                    />
                    Working
                  </span>
                  <span className="cc-cal__legend-item">
                    <span
                      className="cc-cal__swatch cc-cal__swatch--blocked"
                      aria-hidden="true"
                    />
                    Blocked
                  </span>
                  <span className="cc-cal__legend-item">
                    <span
                      className="cc-cal__swatch cc-cal__swatch--none"
                      aria-hidden="true"
                    />
                    No availability
                  </span>
                </div>

                {!hasSlots && (
                  <p className="cc-cal__note">
                    No available slots scheduled for this month.
                  </p>
                )}

                {selectedDetail && (
                  <div className="cc-cal__detail">
                    <div className="cc-cal__detail-head">
                      <span className="cc-cal__detail-date">
                        {selectedDetail.label}
                      </span>
                      {selectedDetail.blocked ? (
                        <Badge variant="error">Blocked</Badge>
                      ) : selectedDetail.daySlots.length > 0 ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="neutral">No availability</Badge>
                      )}
                    </div>

                    {selectedDetail.blocked ? (
                      <>
                        <p className="cc-cal__detail-note">
                          {selectedDetail.blocked.reason ||
                            "Blocked for this date."}
                        </p>
                        {selectedDetail.blocked.note && (
                          <p className="cc-cal__detail-note">
                            {selectedDetail.blocked.note}
                          </p>
                        )}
                        <p className="cc-cal__detail-note">
                          Customers cannot book this date.
                        </p>
                      </>
                    ) : selectedDetail.daySlots.length > 0 ? (
                      <div className="cc-cal__windows">
                        {selectedDetail.daySlots.map((slot, index) => (
                          <span key={index} className="cc-cal__window">
                            {formatWindow(slot)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="cc-cal__detail-note">
                        No availability configured for this day.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
