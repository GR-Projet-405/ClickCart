import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import IconButton from "../IconButton";
import "../components.css";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    dialogRef.current?.focus();
    return () => prev?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="cc-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`cc-modal cc-modal--${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="cc-modal__header">
          <h2 className="cc-modal__title">{title}</h2>
          <IconButton
            icon={<X size={18} />}
            label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>
        <div className="cc-modal__body">{children}</div>
        {footer && <div className="cc-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
