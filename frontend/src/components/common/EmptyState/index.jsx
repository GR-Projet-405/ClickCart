import "../components.css";
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <section className={`cc-empty-state ${className}`.trim()}>
      {icon && (
        <span className="cc-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className="cc-empty-state__title cc-h3">{title}</h3>
      {description && (
        <p className="cc-empty-state__description cc-body-sm">{description}</p>
      )}
      {action}
    </section>
  );
}
