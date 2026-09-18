import Field from "../Field/Field";
import "../components.css";
export default function Textarea({
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
        <textarea
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
