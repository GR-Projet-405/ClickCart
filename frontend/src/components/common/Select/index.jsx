import React from 'react';
import Field from "../Field/Field";
import "../components.css";
export default function Select({
  id,
  label,
  helperText,
  error,
  required,
  children,
  className = "",
  ...props
}) {
  return (
    <Field {...{ id, label, helperText, error, required }}>
      {(field) => (
        <select
          id={field.id}
          className={`cc-field-control ${className}`.trim()}
          required={required}
          aria-invalid={field.invalid}
          aria-describedby={error || helperText ? field.messageId : undefined}
          {...props}
        >
          {children}
        </select>
      )}
    </Field>
  );
}
