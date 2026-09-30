import React from "react";
import Field from "../../../components/common/Field/Field";

/**
 * Text input for the auth pages: shared Field (label, error, aria wiring) plus an optional
 * leading icon, trailing element (e.g. show/hide, "Available") and an action next to the label.
 */
export default function AuthField({
  id,
  label,
  error,
  helperText,
  icon,
  prefix,
  trailing,
  labelAction,
  valid = false,
  className = "",
  ...inputProps
}) {
  return (
    <div className={`auth-field ${className}`.trim()}>
      {labelAction && <div className="auth-field__label-action">{labelAction}</div>}
      <Field id={id} label={label} error={error} helperText={helperText}>
        {(field) => (
          <div
            className={[
              "auth-input",
              error ? "auth-input--invalid" : "",
              valid && !error ? "auth-input--valid" : "",
            ].join(" ").trim()}
          >
            {icon && (
              <span className="auth-input__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            {prefix && <span className="auth-input__prefix">{prefix}</span>}
            <input
              id={field.id}
              className="auth-input__control"
              aria-invalid={field.invalid}
              aria-describedby={error || helperText ? field.messageId : undefined}
              {...inputProps}
            />
            {trailing && <span className="auth-input__trailing">{trailing}</span>}
          </div>
        )}
      </Field>
    </div>
  );
}
