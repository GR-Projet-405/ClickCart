import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * "1 Email > 2 Verify code > 3 New password" progress for the reset flow.
 */
export default function StepIndicator({ steps, current }) {
  return (
    <ol className="auth-steps" aria-label="Password reset progress">
      {steps.map((label, index) => {
        const state = index < current ? "done" : index === current ? "current" : "todo";
        return (
          <li key={label} className={`auth-steps__item auth-steps__item--${state}`} aria-current={state === "current" ? "step" : undefined}>
            {index > 0 && <ChevronRight size={14} className="auth-steps__separator" aria-hidden="true" />}
            <span>
              {index + 1} {label}
            </span>
            {state === "done" && <span className="cc-visually-hidden"> (completed)</span>}
          </li>
        );
      })}
    </ol>
  );
}
