import { Search } from "lucide-react";
import Field from "../Field/Field";
import "../components.css";
export default function SearchInput({
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
        <div className="cc-field__control-wrap">
          <span className="cc-field__leading-icon" aria-hidden="true">
            <Search />
          </span>
          <input
            id={field.id}
            type="search"
            className={`cc-field-control cc-field-control--with-icon ${className}`.trim()}
            required={required}
            aria-invalid={field.invalid}
            aria-describedby={error || helperText ? field.messageId : undefined}
            {...props}
          />
        </div>
      )}
    </Field>
  );
}
