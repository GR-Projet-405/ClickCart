import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "../../../../components/common/Button";
import "./DeleteConfirmModal.css";

export default function DeleteConfirmModal({ open, area, onConfirm, onCancel, deleting }) {
  if (!open || !area) return null;

  return (
    <div className="cc-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="cc-modal-content">
        <button className="cc-modal-close" onClick={onCancel} aria-label="Close dialog">
          <X size={18} />
        </button>
        <div className="cc-modal-icon-wrap">
          <AlertTriangle size={24} className="cc-modal-icon" />
        </div>
        <h3 id="delete-dialog-title" className="cc-modal-title">Archive Service Area?</h3>
        <p className="cc-modal-description">
          Are you sure you want to remove coverage for <strong>{area.cityName}, {area.district}</strong>?
          This service area will be archived and will no longer be visible to customers.
        </p>
        <div className="cc-modal-actions">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={deleting}>
            Archive Area
          </Button>
        </div>
      </div>
    </div>
  );
}
