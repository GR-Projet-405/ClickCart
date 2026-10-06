import { useId, useMemo } from "react";
import { TrendingUp } from "lucide-react";

import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";

import { bookingsTrendData } from "../../config/adminDashboardData";
import styles from "./BookingsTrendPreview.module.css";

/**
 * Phase 5 — Bookings Trend preview (SVG line/area chart).
 *
 * No booking-analytics API exists yet, so the panel renders the sample
 * dataset from config/adminDashboardData.js and performs no network calls.
 * Pass a real payload later with `data` — only these fields are read:
 *   { label: string, bookings: number }
 *
 * Geometry (min/max, X/Y positions, line + area paths, point positions) is
 * derived from the data on every render, so the chart keeps working when the
 * number or the values of the points change. Empty, single-point and
 * invalid/missing values are handled without crashing.
 */

const VIEW_W = 420;
const VIEW_H = 170;
const PAD = { top: 14, right: 6, bottom: 14, left: 6 };
const TICKS = 4;

const format = (value) =>
  Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });

/** Keeps only points that carry a finite value; tolerates odd payloads. */
function normalise(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((point, index) => {
      if (point === null || point === undefined) return null;

      const source =
        typeof point === "number"
          ? point
          : point.bookings ?? point.value ?? point.count;
      const value = Number(source);
      if (!Number.isFinite(value)) return null;

      const label =
        typeof point === "object" && typeof point.label === "string" && point.label.trim()
          ? point.label
          : `Point ${index + 1}`;

      return { label, value };
    })
    .filter(Boolean);
}

function buildGeometry(points) {
  const values = points.map((point) => point.value);
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);
  const spread = dataMax - dataMin;

  // Pad the range so the trend stays readable instead of a flat line.
  const pad = spread > 0 ? spread * 0.18 : Math.max(Math.abs(dataMax) * 0.1, 1);
  const yMax = dataMax + pad;
  const yMin = Math.max(0, dataMin - pad);
  const range = yMax - yMin || 1;

  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = VIEW_H - PAD.top - PAD.bottom;

  const xAt = (index) =>
    points.length === 1
      ? PAD.left + plotW / 2
      : PAD.left + (index * plotW) / (points.length - 1);

  const yAt = (value) => PAD.top + (1 - (value - yMin) / range) * plotH;

  const coords = points.map((point, index) => {
    const x = xAt(index);
    const y = yAt(point.value);
    return {
      ...point,
      x,
      y,
      xPercent: (x / VIEW_W) * 100,
      yPercent: (y / VIEW_H) * 100,
    };
  });

  const ticks = Array.from({ length: TICKS }, (_, index) => {
    const value = yMin + (index * range) / (TICKS - 1);
    const y = yAt(value);
    return { value, y, yPercent: (y / VIEW_H) * 100 };
  }).reverse(); // top -> bottom for the HTML scale column

  const baseline = VIEW_H - PAD.bottom;

  const linePath =
    points.length === 1
      ? `M ${PAD.left} ${yAt(points[0].value)} L ${VIEW_W - PAD.right} ${yAt(points[0].value)}`
      : coords
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
          .join(" ");

  const areaPath =
    points.length === 1
      ? `M ${PAD.left} ${coords[0].y} L ${VIEW_W - PAD.right} ${coords[0].y} L ${
          VIEW_W - PAD.right
        } ${baseline} L ${PAD.left} ${baseline} Z`
      : `${linePath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`;

  const peak = coords.reduce((best, point) => (point.value > best.value ? point : best), coords[0]);

  return { coords, ticks, linePath, areaPath, baseline, peak };
}

export default function BookingsTrendPreview({ data = bookingsTrendData }) {
  const gradientId = useId();
  const points = useMemo(() => normalise(data), [data]);
  const geometry = useMemo(
    () => (points.length ? buildGeometry(points) : null),
    [points],
  );

  if (!points.length || !geometry) {
    return (
      <EmptyState
        icon={<TrendingUp size={20} />}
        title="No booking data"
        description="Booking volume for the selected period will appear here."
      />
    );
  }

  const { coords, ticks, linePath, areaPath, baseline, peak } = geometry;
  const first = coords[0];
  const last = coords[coords.length - 1];

  const description =
    `Bookings trend, ${coords.length} point${coords.length === 1 ? "" : "s"} ` +
    `from ${first.label} ${format(first.value)} bookings ` +
    `to ${last.label} ${format(last.value)} bookings. ` +
    `Peak ${format(peak.value)} bookings on ${peak.label}.`;

  const labelStyle = (index) => {
    if (coords.length === 1) {
      return { left: "50%", transform: "translateX(-50%)" };
    }
    if (index === 0) return { left: 0 };
    if (index === coords.length - 1) {
      return { left: "100%", transform: "translateX(-100%)" };
    }
    return { left: `${coords[index].xPercent}%`, transform: "translateX(-50%)" };
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <span className={styles.legend}>
          <span className={styles.legendDot} aria-hidden="true" />
          Bookings
        </span>
        <Badge variant="neutral">Sample data</Badge>
      </div>

      <div className={styles.chart}>
        <div className={styles.scale}>
          {ticks.map((tick, index) => (
            <span
              className={styles.yLabel}
              key={`tick-${index}`}
              style={{ top: `${tick.yPercent}%` }}
            >
              {format(tick.value)}
            </span>
          ))}
        </div>

        <div className={styles.plot}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            role="img"
            aria-label={description}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className={styles.stopTop} />
                <stop offset="100%" className={styles.stopBottom} />
              </linearGradient>
            </defs>

            {ticks.map((tick, index) => (
              <line
                className={styles.grid}
                key={`grid-${index}`}
                x1="0"
                x2={VIEW_W}
                y1={tick.y}
                y2={tick.y}
              />
            ))}

            <line
              className={styles.axis}
              x1="0"
              x2={VIEW_W}
              y1={baseline}
              y2={baseline}
            />

            <path className={styles.area} d={areaPath} fill={`url(#${gradientId})`} />
            <path className={styles.line} d={linePath} />

            {coords.map((point, index) => (
              <circle
                className={styles.point}
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r="3.4"
              />
            ))}
          </svg>
        </div>

        <div className={styles.xAxis}>
          {coords.map((point, index) => (
            <span className={styles.xLabel} key={`x-${index}`} style={labelStyle(index)}>
              {point.label}
            </span>
          ))}
        </div>
      </div>

      <p className={styles.summary}>
        Peak: <strong>{format(peak.value)}</strong> bookings
        <span aria-hidden="true"> · </span>
        {first.label} to {last.label}
      </p>
    </div>
  );
}
