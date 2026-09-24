import React from 'react';
import "../components.css";
export default function IconButton({
  icon,
  label,
  variant = "default",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      className={`cc-icon-button cc-icon-button--${variant} cc-icon-button--${size} ${className}`.trim()}
      type={type}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
