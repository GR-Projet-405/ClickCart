import { TrendingDown, TrendingUp } from "lucide-react";

import Card from "../common/Card";
import styles from "./StatCard.module.css";

/**
 * Reusable dashboard metric card.
 *
 * Renders a compact stat tile with a tinted icon, label, strong value,
 * trend indicator and muted hint text. Colours come from the shared
 * --cc-* design tokens only.
 *
 * @param {string}   id              stable id passed to the root element
 * @param {Function} icon            lucide-react icon component
 * @param {string}   label           card heading
 * @param {string}   value           displayed metric
 * @param {string}   trend           displayed trend text, e.g. "+12%"
 * @param {string}   trendDirection  "positive" | "negative"
 * @param {string}   trendTone       optional override: "positive" | "negative"
 * @param {string}   hint            muted helper text
 * @param {string}   tone            icon tint: green | blue | amber | red | neutral
 * @param {string}   className       additional class names for the root card
 */
export default function StatCard({
  id,
  icon: Icon,
  label,
  value,
  trend,
  trendDirection = "positive",
  trendTone,
  hint,
  tone = "green",
  className = "",
}) {
  const isPositive =
    (trendTone ?? trendDirection) === "positive";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendClass = isPositive ? styles.positive : styles.negative;

  return (
    <Card
      id={id}
      padding="none"
      className={`${styles.card} ${className}`.trim()}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span
          className={`${styles.icon} ${styles[`icon--${tone}`] ?? ""}`.trim()}
          aria-hidden="true"
        >
          {Icon ? <Icon size={18} /> : null}
        </span>
      </div>

      <strong className={styles.value}>{value}</strong>

      <div className={styles.footer}>
        <span className={`${styles.trend} ${trendClass}`.trim()}>
          <TrendIcon size={13} aria-hidden="true" />
          {trend}
        </span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    </Card>
  );
}
