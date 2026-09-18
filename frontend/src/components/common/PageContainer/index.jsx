import "../components.css";
export default function PageContainer({
  children,
  className = "",
  as: Element = "div",
  ...props
}) {
  return (
    <Element className={`cc-page-container ${className}`.trim()} {...props}>
      {children}
    </Element>
  );
}
