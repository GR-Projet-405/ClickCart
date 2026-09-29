import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import "./Toast.css";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`cc-toast cc-toast--${type}`} role="alert">
      <span className="cc-toast__icon">
        {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </span>
      <span className="cc-toast__message">{message}</span>
      <button className="cc-toast__close" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
