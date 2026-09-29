import React from "react";
import Modal from "../Modal";
import Button from "../Button";
import "../components.css";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
}) {
  function handleConfirm() {
    onConfirm?.();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="cc-confirm-dialog__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="sm"
            loading={loading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {message && <p className="cc-confirm-dialog__message">{message}</p>}
    </Modal>
  );
}
