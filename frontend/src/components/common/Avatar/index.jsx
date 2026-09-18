import { useState } from "react";
import "../components.css";
export default function Avatar({
  src,
  alt = "",
  fallback = "?",
  size = "md",
  online = false,
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`cc-avatar cc-avatar--${size} ${className}`.trim()}>
      {src && !failed ? (
        <img
          className="cc-avatar__image"
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={alt || `Avatar: ${fallback}`}>{fallback}</span>
      )}
      {online && <span className="cc-avatar__online" aria-label="Online" />}
    </span>
  );
}
