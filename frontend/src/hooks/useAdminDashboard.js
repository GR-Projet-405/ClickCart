import { useCallback, useEffect, useState } from "react";
import { fetchAdminCategories, fetchAuditLog, fetchCommissionDashboard, fetchVerifications } from "../services/adminDashboardService";
const initial = () => ({ loading: true, error: "", source: "api", data: null });
export default function useAdminDashboard() {
  const [sections, setSections] = useState({ verification: initial(), revenue: initial(), categories: initial(), audit: initial() });
  const [refreshing, setRefreshing] = useState(false);
  const reload = useCallback(async () => {
    setRefreshing(true);
    const requests = {
      verification: [fetchVerifications, x => x],
      revenue: [fetchCommissionDashboard, x => ({ metrics: { totalGmv: "Not available", totalRefunds: "Not available", platformCommission: x.totalRevenue == null ? "Not available" : `LKR ${Number(x.totalRevenue).toLocaleString()}` }, trend: x.revenueTrend || [] })],
      categories: [fetchAdminCategories, rows => ({ rows, total: rows.length, active: rows.filter(r => r.active).length })],
      audit: [fetchAuditLog, x => x],
    };
    await Promise.all(Object.entries(requests).map(async ([key, [request, map]]) => {
      setSections(s => ({ ...s, [key]: initial() }));
      try { const data = map(await request()); setSections(s => ({ ...s, [key]: { loading: false, error: "", source: "api", data } })); }
      catch (e) { setSections(s => ({ ...s, [key]: { loading: false, error: e.message || "Could not load data", source: "api", data: null } })); }
    }));
    setRefreshing(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { ...sections, refreshing, reload };
}
