import React, { useState } from "react";
import { Pencil, Trash2, MoreVertical, MapPin, Eye } from "lucide-react";
import ServiceAreaStatusToggle from "./ServiceAreaStatusToggle";
import EmptyState from "../../../../components/common/EmptyState";
import Button from "../../../../components/common/Button";
import "./ServiceAreaTable.css";

export default function ServiceAreaTable({
  areas,
  loading,
  onEdit,
  onDelete,
  onStatusToggle,
  onAddClick,
  onViewLocation,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (loading && (!areas || areas.length === 0)) {
    return (
      <div className="cc-table-loading-wrap">
        <div className="cc-table-skeleton-row" />
        <div className="cc-table-skeleton-row" />
        <div className="cc-table-skeleton-row" />
        <div className="cc-table-skeleton-row" />
      </div>
    );
  }

  if (!areas || areas.length === 0) {
    return (
      <EmptyState
        icon={<MapPin size={24} />}
        title="No Service Areas Found"
        description="You have not configured any service coverage areas yet or no areas match your search filters."
        action={
          <Button variant="primary" onClick={onAddClick}>
            + Add Service Area
          </Button>
        }
      />
    );
  }

  return (
    <div className="cc-table-responsive-wrapper">
      <table className="cc-service-areas-table">
        <thead>
          <tr>
            <th scope="col">City / District</th>
            <th scope="col">Postal Code</th>
            <th scope="col">Radius (Km)</th>
            <th scope="col">Status</th>
            <th scope="col" className="cc-table-actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area.id} className="cc-service-areas-row">
              <td className="cc-cell-city-district" data-label="City / District">
                <strong className="cc-city-name">{area.cityName}</strong>
                <span className="cc-district-name">{area.district}</span>
              </td>
              <td className="cc-cell-postal" data-label="Postal Code">
                {area.postalCode || "-"}
              </td>
              <td className="cc-cell-radius" data-label="Radius (Km)">
                <strong>{area.radiusKm}</strong>
              </td>
              <td className="cc-cell-status" data-label="Status">
                <ServiceAreaStatusToggle
                  active={area.active}
                  onChange={(newActive) => onStatusToggle(area.id, newActive)}
                />
              </td>
              <td className="cc-cell-actions" data-label="Actions">
                <div className="cc-actions-group">
                  <button
                    type="button"
                    className="cc-action-btn cc-action-btn--edit"
                    title="Edit Service Area"
                    aria-label={`Edit ${area.cityName}`}
                    onClick={() => onEdit(area)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="cc-action-btn cc-action-btn--delete"
                    title="Archive Service Area"
                    aria-label={`Archive ${area.cityName}`}
                    onClick={() => onDelete(area)}
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="cc-overflow-menu-wrap">
                    <button
                      type="button"
                      className="cc-action-btn cc-action-btn--more"
                      title="More Options"
                      aria-label="More options"
                      aria-expanded={activeMenuId === area.id}
                      onClick={(e) => toggleMenu(area.id, e)}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {activeMenuId === area.id && (
                      <div className="cc-dropdown-menu" role="menu">
                        {onViewLocation && (
                          <button
                            type="button"
                            className="cc-dropdown-item"
                            role="menuitem"
                            onClick={() => {
                              setActiveMenuId(null);
                              onViewLocation(area);
                            }}
                          >
                            <Eye size={14} />
                            <span>Preview Coverage</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="cc-dropdown-item"
                          role="menuitem"
                          onClick={() => {
                            setActiveMenuId(null);
                            onEdit(area);
                          }}
                        >
                          <Pencil size={14} />
                          <span>Edit Details</span>
                        </button>
                        <button
                          type="button"
                          className="cc-dropdown-item cc-dropdown-item--danger"
                          role="menuitem"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDelete(area);
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Archive Area</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
