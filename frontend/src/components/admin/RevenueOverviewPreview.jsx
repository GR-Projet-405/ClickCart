import { AlertCircle, CircleDollarSign, Percent } from "lucide-react";

import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

import CommissionChart from "../commission/CommissionChart";
import styles from "./RevenueOverviewPreview.module.css";

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

      <p className={styles.footnote}>Commission comes from stored transactions. GMV and refund totals are not available from this endpoint.</p>
    </div>
  );
}
