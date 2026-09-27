import React from "react";

/**
 * Two-option segmented control (e.g. Customer / Service Provider), exposed as a radio group.
 */
export default function RoleToggle({ label, options, value, onChange }) {
  const handleKeyDown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    event.currentTarget.querySelector(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div className="auth-role-toggle" role="radiogroup" aria-label={label} onKeyDown={handleKeyDown}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-value={option.value}
            className={`auth-role-toggle__option ${selected ? "auth-role-toggle__option--selected" : ""}`.trim()}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
