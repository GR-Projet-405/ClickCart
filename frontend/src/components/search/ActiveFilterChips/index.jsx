import { X } from "lucide-react";
import "../search.css";

export default function ActiveFilterChips({ filters, onRemove }) {
  if (!filters.length) {
    return null;
  }

  return (
    <div className="marketplace-filter-chip-row" aria-label="Active filters">
      {filters.map((filter) => (
        <span key={filter.id} className="marketplace-filter-chip">
          <span>{filter.label}</span>
          <button type="button" aria-label={`Remove ${filter.label}`} onClick={() => onRemove(filter.id)}>
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
