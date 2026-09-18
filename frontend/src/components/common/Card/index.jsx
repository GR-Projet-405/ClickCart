import "../components.css";
export default function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  as: Element = "div",
  ...props
}) {
  return (
    <Element
      className={`cc-card cc-card--${variant} cc-card--padding-${padding} ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}
