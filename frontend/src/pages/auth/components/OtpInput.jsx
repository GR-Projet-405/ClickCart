import React from "react";
import { useRef, useState } from "react";

/**
 * Six single-digit boxes for a verification code.
 * Typing moves forward, Backspace moves back, arrow keys navigate, and pasting or phone
 * autofill ("one-time-code") fills every box at once.
 * Reset it by changing the `key` prop from the parent.
 */
export default function OtpInput({ length = 6, onChange, invalid = false, disabled = false, describedBy, autoFocus = false }) {
  const [digits, setDigits] = useState(() => Array(length).fill(""));
  const inputs = useRef([]);

  const focusBox = (index) => {
    const target = inputs.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select();
  };

  const commit = (next) => {
    setDigits(next);
    onChange(next.join(""), next.every(Boolean));
  };

  const fillFrom = (start, text) => {
    const incoming = text.replace(/\D/g, "").slice(0, length - start).split("");
    if (incoming.length === 0) return;
    const next = [...digits];
    incoming.forEach((digit, offset) => {
      next[start + offset] = digit;
    });
    commit(next);
    focusBox(start + incoming.length);
  };

  const handleChange = (index) => (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length > 1) {
      fillFrom(index, value);
      return;
    }
    const next = [...digits];
    next[index] = value;
    commit(next);
    if (value) focusBox(index + 1);
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      commit(next);
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index) => (event) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  return (
    <div
      className={`auth-otp ${invalid ? "auth-otp--invalid" : ""}`.trim()}
      role="group"
      aria-label={`${length}-digit verification code`}
      aria-describedby={describedBy}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          className="auth-otp__box"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste(index)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
