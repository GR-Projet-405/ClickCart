import React from 'react';
import "../components.css";
export default function Spinner({
  size = "md",
  label = "Loading",
  className = "",
}) {
  return (
    <span
      className={`cc-spinner cc-spinner--${size} ${className}`.trim()}
      role="status"
    >
      <span className="cc-visually-hidden">{label}</span>
    </span>
  );
}
