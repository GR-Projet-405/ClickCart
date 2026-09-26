import React from "react";
import "./ServiceAreaStatusToggle.css";

export default function ServiceAreaStatusToggle({ active, onChange, disabled, showLabel = true }) {
  const isChecked = Boolean(active);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <div className="cc-status-toggle-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        className={`cc-status-toggle ${isChecked ? "cc-status-toggle--active" : ""}`}
      >
        <span className="cc-status-toggle__thumb" />
      </button>
      {showLabel && (
        <span className={`cc-status-toggle__label ${isChecked ? "cc-status-toggle__label--active" : ""}`}>
          {isChecked ? "Active" : "Inactive"}
        </span>
      )}
    </div>
  );
}
