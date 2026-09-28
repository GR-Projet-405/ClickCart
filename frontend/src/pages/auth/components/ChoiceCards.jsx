import React from "react";
import { Check } from "lucide-react";

/**
 * Radio group rendered as selectable cards (role choice, provider type).
 * Uses native radio inputs, so keyboard and screen-reader behaviour come for free.
 *
 * @param variant "card" (large, with icon) or "compact" (radio dot + text)
 */
export default function ChoiceCards({ name, legend, legendNote, options, value, onChange, error, variant = "card" }) {
  return (
    <fieldset
      className={`auth-choices auth-choices--${variant} ${error ? "auth-choices--invalid" : ""}`.trim()}
      aria-describedby={error ? `${name}-error` : undefined}
    >
      <legend className="auth-choices__legend">
        {legend}
        {legendNote && <span className="auth-choices__note">{legendNote}</span>}
      </legend>
      <div className="auth-choices__grid">
        {options.map((option) => {
          const selected = option.value === value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={`auth-choice ${selected ? "auth-choice--selected" : ""}`.trim()}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="auth-choice__input"
              />
              {variant === "card" ? (
                <>
                  <span className="auth-choice__icon" aria-hidden="true">
                    {Icon && <Icon size={20} />}
                  </span>
                  <span className="auth-choice__check" aria-hidden="true">
                    {selected && <Check size={14} />}
                  </span>
                </>
              ) : (
                <span className="auth-choice__dot" aria-hidden="true" />
              )}
              <span className="auth-choice__text">
                <span className="auth-choice__title">{option.label}</span>
                <span className="auth-choice__description">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${name}-error`} className="auth-choices__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
