import React from 'react';
import Spinner from "../Spinner";
import "../components.css";
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const { leftIcon: _, rightIcon: __, ...domProps } = props;
  return (
    <button
      className={`cc-button cc-button--${variant} cc-button--${size} ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
      {...domProps}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        leftIcon && (
          <span className="cc-button__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="cc-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
