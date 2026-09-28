import React from 'react';
import Field from "../Field/Field";
import "../components.css";
export default function Input({
  id,
  label,
  helperText,
  error,
  required,
  className = "",
  ...props
}) {
  return (
    <Field {...{ id, label, helperText, error, required }}>
      {(field) => (
        <input
          id={field.id}
          className={`cc-field-control ${className}`.trim()}
          required={required}
          aria-invalid={field.invalid}
          aria-describedby={error || helperText ? field.messageId : undefined}
          {...props}
        />
      )}
    </Field>
  );
}
