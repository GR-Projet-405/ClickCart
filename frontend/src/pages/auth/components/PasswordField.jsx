import React from "react";
import { useState } from "react";
import AuthField from "./AuthField";

/**
 * Password input with a Show/Hide toggle.
 */
export default function PasswordField({ trailingExtra, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      type={visible ? "text" : "password"}
      spellCheck={false}
      autoCapitalize="none"
      trailing={
        <>
          {trailingExtra}
          <button
            type="button"
            className="auth-input__toggle"
            onClick={() => setVisible((current) => !current)}
            aria-pressed={visible}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </>
      }
    />
  );
}
