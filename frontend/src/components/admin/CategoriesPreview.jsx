import { useMemo } from "react";
import { FolderTree } from "lucide-react";
import * as LucideIcons from "lucide-react";

import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";
import Spinner from "../common/Spinner";

import styles from "./CategoriesPreview.module.css";

/**
 * Compact preview of Service Categories Management for the admin dashboard.
 *
 * Reads the same GET /admin/categories payload as
 * pages/AdminCategoryDashboard.jsx (via categoryService) but renders a short
 * list instead of the full CategoryTable. No category feature file is touched.
 */
export default function CategoriesPreview({ loading, source, data, error }) {
  const rows = Array.isArray(data?.rows) ? data.rows : [];

  const visible = useMemo(() => rows.slice(0, 4), [rows]);

  if (loading) {
    return (
      <div className={styles.state}>
        <Spinner label="Loading service categories" />
      </div>
    );
  }

  if (!visible.length) {
    return (
      <EmptyState
        icon={<FolderTree size={20} />}
        title="No service categories"
        description="Create categories to start organising provider services."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.summary}>
        <strong>{data?.active ?? rows.length}</strong> active
        <span aria-hidden="true"> · </span>
        {data?.total ?? rows.length} total categories
      </p>

      <ul className={styles.list}>
        {visible.map((row, index) => {
          const Icon = (row.icon && LucideIcons[row.icon]) || LucideIcons.LayoutGrid;

          return (
            <li className={styles.row} key={row.id ?? row.name}>
              <span
                className={`${styles.icon} ${styles[`tone${index % 4}`]}`}
                aria-hidden="true"
              >
                <Icon size={16} />
              </span>

              <span className={styles.identity}>
                <span className={styles.name}>{row.name}</span>
                <span className={styles.meta}>
                  {row.services} {row.services === 1 ? "service" : "services"}
                </span>
              </span>

              <Badge variant={row.active ? "success" : "neutral"}>
                {row.active ? "Active" : "Paused"}
              </Badge>
            </li>
          );
        })}
      </ul>


    </div>
  );
}
