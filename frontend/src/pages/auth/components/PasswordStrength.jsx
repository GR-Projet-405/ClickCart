import React from "react";
import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES, passwordStrength } from "../validation";

/**
 * Strength meter (4 bars) and, optionally, the live rule checklist shown under a new-password field.
 */
export default function PasswordStrength({ password, showRules = true, id }) {
  const { score, label } = passwordStrength(password);
  const level = score <= 1 ? "weak" : score === 2 ? "fair" : "strong";
  const missing = PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label.toLowerCase());

  return (
    <div className="auth-strength" id={id}>
      <div className={`auth-strength__bars auth-strength__bars--${password ? level : "empty"}`} aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <span key={bar} className={bar <= score ? "auth-strength__bar--on" : undefined} />
        ))}
      </div>
      <div className="auth-strength__summary">
        <span>Strength</span>
        {password && (
          <span className={`auth-strength__label auth-strength__label--${level}`} aria-live="polite">
            {label}
            {!showRules && level !== "strong" && missing.length > 0 && ` — add ${missing.slice(0, 2).join(" and ")}`}
          </span>
        )}
      </div>
      {showRules && (
        <ul className="auth-strength__rules" aria-label="Password requirements">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password);
            return (
              <li key={rule.id} className={met ? "auth-strength__rule--met" : undefined}>
                {met ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
                <span>
                  {rule.label}
                  {rule.optional && <span className="cc-visually-hidden"> (optional)</span>}
                </span>
                <span className="cc-visually-hidden">{met ? " — met" : " — not met"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
