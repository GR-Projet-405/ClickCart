import React from 'react';
import { Link } from "react-router-dom";
import "./navigation.css";
export default function NavigationItem({
  kind,
  icon,
  label,
  active = false,
  badge,
  disabled = false,
  to,
  onClick,
  className = "",
}) {
  const classes =
    `${kind} ${active ? `${kind}--active` : ""} ${disabled ? `${kind}--disabled` : ""} ${className}`.trim();
  const content = (
    <>
      {icon && (
        <span className="cc-navigation-item__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="cc-navigation-item__label">{label}</span>
      {badge != null && (
        <span className="cc-navigation-item__badge">{badge}</span>
      )}
    </>
  );
  return to ? (
    <Link
      className={classes}
      to={to}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={disabled ? (event) => event.preventDefault() : onClick}
    >
      {content}
    </Link>
  ) : (
    <button
      className={classes}
      type="button"
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
