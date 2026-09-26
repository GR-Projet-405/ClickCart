import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Filter } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import SearchInput from "../../../components/common/SearchInput";
import ServiceAreaSummaryCards from "./components/ServiceAreaSummaryCards";
import ServiceAreaTable from "./components/ServiceAreaTable";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import Toast from "./components/Toast";
import {
  fetchServiceAreas,
  fetchSummary,
  updateServiceAreaStatus,
  deleteServiceArea,
} from "../../../services/serviceAreaApi";
import "./ServiceAreasPage.css";

export default function ServiceAreasPage() {
  const navigate = useNavigate();

  const [areas, setAreas] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Filters and Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal & Toast states
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const loadSummaryData = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await fetchSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadServiceAreas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchServiceAreas({
        page,
        size: pageSize,
        search,
        status: statusFilter,
      });
      setAreas(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setToast({
        message: err.message || "Failed to load service areas",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  useEffect(() => {
    loadServiceAreas();
  }, [loadServiceAreas]);

  // Status toggle handler
  const handleStatusToggle = async (id, newActive) => {
    try {
      // Optimistic update
      setAreas((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, active: newActive, status: newActive ? "ACTIVE" : "INACTIVE" } : a
        )
      );

      await updateServiceAreaStatus(id, newActive);
      setToast({
        message: `Service area status changed to ${newActive ? "Active" : "Inactive"}.`,
        type: "success",
      });
      loadSummaryData();
    } catch (err) {
      // Rollback on error
      setAreas((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, active: !newActive, status: !newActive ? "ACTIVE" : "INACTIVE" } : a
        )
      );
      setToast({
        message: err.message || "Failed to update status",
        type: "error",
      });
    }
  };

  // Delete / Archive handler
  const handleConfirmDelete = async () => {
    if (!areaToDelete) return;
    try {
      setDeleting(true);
      await deleteServiceArea(areaToDelete.id);
      setToast({
        message: `Service area for ${areaToDelete.cityName} archived successfully.`,
        type: "success",
      });
      setAreaToDelete(null);
      loadServiceAreas();
      loadSummaryData();
    } catch (err) {
      setToast({
        message: err.message || "Failed to delete service area",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (area) => {
    navigate(`/provider/service-areas/${area.id}/edit`);
  };

  const fromIndex = totalElements === 0 ? 0 : page * pageSize + 1;
  const toIndex = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="cc-service-areas-page">
      {/* Top Header matching Screenshot 1 */}
      <div className="cc-sa-page-header">
        <div className="cc-sa-page-header__left">
          <div className="cc-sa-header-icon-badge">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="cc-sa-header-title">Service Areas</h1>
            <p className="cc-sa-header-subtitle">
              Manage your service coverage areas and reach more customers.
            </p>
          </div>
        </div>
        <div className="cc-sa-page-header__right">
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate("/provider/service-areas/new")}
          >
            Add Service Area
          </Button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <ServiceAreaSummaryCards summary={summary} loading={summaryLoading} />

      {/* Main Table Card */}
      <Card className="cc-sa-list-card" padding="none">
        <div className="cc-sa-list-toolbar">
          <h2 className="cc-sa-list-title">Service Area List</h2>
          <div className="cc-sa-list-controls">
            <div className="cc-sa-search-wrap">
              <SearchInput
                placeholder="Search by city or district..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <div className="cc-sa-filter-dropdown-wrap">
              <Filter size={15} className="cc-sa-filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="cc-sa-status-select"
                aria-label="Filter service areas by status"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <ServiceAreaTable
          areas={areas}
          loading={loading}
          onEdit={handleEdit}
          onDelete={(area) => setAreaToDelete(area)}
          onStatusToggle={handleStatusToggle}
          onAddClick={() => navigate("/provider/service-areas/new")}
          onViewLocation={handleEdit}
        />

        {/* Footer with pagination */}
        {totalElements > 0 && (
          <div className="cc-sa-table-footer">
            <span className="cc-sa-footer-counter">
              Showing {fromIndex}-{toIndex} of {totalElements} areas
            </span>
            <div className="cc-sa-pagination">
              <button
                type="button"
                className="cc-page-btn"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Previous page"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`cc-page-btn ${page === i ? "cc-page-btn--active" : ""}`}
                  onClick={() => setPage(i)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={page === i ? "page" : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="cc-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete / Archive Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(areaToDelete)}
        area={areaToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAreaToDelete(null)}
        deleting={deleting}
      />

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}
