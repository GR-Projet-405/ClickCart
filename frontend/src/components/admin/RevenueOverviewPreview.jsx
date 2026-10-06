import { AlertCircle, CircleDollarSign, Percent } from "lucide-react";

import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

import CommissionChart from "../commission/CommissionChart";
import styles from "./RevenueOverviewPreview.module.css";

/**
 * Compact "Revenue & Commission Overview" preview for the admin dashboard.
 *
 * Reuses the existing CommissionChart component (pages/commission and
 * components/commission stay untouched). The chart's stylesheet already ships
 * with the app bundle, so no commission CSS is imported here.
 *
 * Figures come from GET /admin/commission/dashboard. GMV and refunds are not
 * exposed by that endpoint, so they fall back to the explicit mock values in
 * config/adminDashboardData.js instead of breaking the section.
 */
export default function RevenueOverviewPreview({
  loading,
  source,
  data,
  error,
}) {
  const metrics = data?.metrics;
  const trend = data?.trend || [];

  if (loading) {
    return (
      <div className={styles.state}>
        <Spinner label="Loading revenue data" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <EmptyState
        icon={<AlertCircle size={20} />}
        title="Revenue data unavailable"
        description="The commission service did not return any figures."
      />
    );
  }

  const entries = [
    { id: "gmv", label: "Total GMV", value: metrics.totalGmv },
    { id: "commission", label: "Platform Commission", value: metrics.platformCommission },
    { id: "refunds", label: "Total Refunds", value: metrics.totalRefunds },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.metrics}>
        {entries.map((entry) => (
          <div className={styles.metric} key={entry.id}>
            <span className={styles.metricValue}>{entry.value}</span>
            <span className={styles.metricLabel}>{entry.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.chart}>
        <CommissionChart data={trend} />
      </div>

      <p className={styles.footnote} role="status">
        {source === "fallback" ? (
          <>
            Commission service unavailable
            {error ? ` (${error})` : ""} — showing sample figures.
          </>
        ) : (
          <>
            <CircleDollarSign size={13} aria-hidden="true" />
            Commission is read from the live API
            <span aria-hidden="true"> · </span>
            <Percent size={13} aria-hidden="true" />
            GMV and refunds are sample values until the API exposes them.
          </>
        )}
      </p>
    </div>
  );
}
