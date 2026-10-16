import { useCallback, useEffect, useState } from "react";

import {
  fetchAdminCategories,
  fetchAuditLog,
  fetchCommissionDashboard,
  fetchVerifications,
} from "../services/adminDashboardService";
import {
  fallbackAuditLog,
  fallbackCategories,
  fallbackRevenue,
  fallbackVerificationRows,
} from "../config/adminDashboardData";

/**
 * Loads the four API-backed Platform Admin Dashboard sections.
 *
 * Every section is independent: one failing endpoint never breaks the page.
 * On failure the section flips to `source: "fallback"` and exposes the mock
 * data from config/adminDashboardData.js, so the UI stays renderable when
 * the backend is unavailable.
 *
 * @returns {{
 *   verification: {loading:boolean, error:string, source:string, data:Array},
 *   revenue: {loading:boolean, error:string, source:string, data:object},
 *   categories: {loading:boolean, error:string, source:string, data:object},
 *   audit: {loading:boolean, error:string, source:string, data:Array},
 *   refreshing: boolean,
 *   reload: () => void
 * }}
 */

const loadingSection = () => ({ loading: true, error: "", source: "api", data: null });

const money = (value) =>
  `LKR ${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;

function toRevenue(payload) {
  const trend = Array.isArray(payload?.revenueTrend) ? payload.revenueTrend : [];

  return {
    metrics: {
      // GMV and refunds are not exposed by the commission API yet.
      totalGmv: fallbackRevenue.metrics.totalGmv,
      platformCommission:
        payload?.totalRevenue === null || payload?.totalRevenue === undefined
          ? fallbackRevenue.metrics.platformCommission
          : money(payload.totalRevenue),
      totalRefunds: fallbackRevenue.metrics.totalRefunds,
    },
    trend: trend.length ? trend : fallbackRevenue.trend,
  };
}

function toCategories(rows) {
  return {
    rows,
    total: rows.length,
    active: rows.filter((row) => row.active).length,
  };
}

export default function useAdminDashboard() {
  const [sections, setSections] = useState(() => ({
    verification: loadingSection(),
    revenue: loadingSection(),
    categories: loadingSection(),
    audit: loadingSection(),
  }));
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (key, request, toFallback, toData) => {
    setSections((prev) => ({ ...prev, [key]: loadingSection() }));

    try {
      const payload = await request();
      setSections((prev) => ({
        ...prev,
        [key]: { loading: false, error: "", source: "api", data: toData(payload) },
      }));
    } catch (error) {
      setSections((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          error: error?.message || "Service unavailable",
          source: "fallback",
          data: toFallback(),
        },
      }));
    }
  }, []);

  const reload = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      load("verification", fetchVerifications, () => fallbackVerificationRows, (rows) => rows),
      load("revenue", fetchCommissionDashboard, () => fallbackRevenue, toRevenue),
      load("categories", fetchAdminCategories, () => fallbackCategories, toCategories),
      load("audit", fetchAuditLog, () => fallbackAuditLog, (entries) => entries),
    ]);
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...sections, refreshing, reload };
}
