import React from "react";
import { AlertCircle, CheckCircle2, Info, Lock } from "lucide-react";

const ICONS = {
  error: AlertCircle,
  warning: Lock,
  success: CheckCircle2,
  info: Info,
};

/**
 * Inline message box used for login errors, lockout, "check your inbox", etc.
 * Errors are announced immediately (role="alert"); other variants politely (role="status").
 */
export default function AuthAlert({ variant = "error", title, children, action }) {
  const Icon = ICONS[variant] || Info;
  return (
    <div className={`auth-alert auth-alert--${variant}`} role={variant === "error" ? "alert" : "status"}>
      <span className="auth-alert__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="auth-alert__body">
        {title && <p className="auth-alert__title">{title}</p>}
        {children && <div className="auth-alert__text">{children}</div>}
        {action && <div className="auth-alert__action">{action}</div>}
      </div>
    </div>
  );
}
