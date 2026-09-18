import "../components.css";
export default function Badge({
  children,
  variant = "neutral",
  className = "",
  ...props
}) {
  return (
    <span
      className={`cc-badge cc-badge--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
