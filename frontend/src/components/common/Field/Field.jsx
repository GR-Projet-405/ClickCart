import React from 'react';
import { useId } from "react";
export default function Field({
  id: given,
  label,
  helperText,
  error,
  required,
  children,
}) {
  const generated = useId();
  const id = given || generated;
  const messageId = `${id}-message`;
  return (
    <div className="cc-field">
      {label && (
        <label className="cc-field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="cc-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      {children({ id, messageId, invalid: Boolean(error) })}
      {(error || helperText) && (
        <p
          id={messageId}
          className={`cc-field__message ${error ? "cc-field__message--error" : ""}`}
          role={error ? "alert" : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
