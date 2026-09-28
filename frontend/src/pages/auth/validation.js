/**
 * Client-side validation for the auth forms. These rules mirror the backend
 * (PasswordPolicy, RegisterRequest), which remains authoritative.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SRI_LANKA_MOBILE_PATTERN = /^(?:\+94|0)?[\s-]*7(?:[\s-]*\d){8}$/;
const FULL_NAME_PATTERN = /^[\p{L} .'-]+$/u;

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    hint: "more characters",
    test: (value) => value.length >= 8 && value.length <= 64,
  },
  {
    id: "case",
    label: "Upper & lowercase letter",
    hint: "upper & lowercase letters",
    test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { id: "number", label: "One number", hint: "a number", test: (value) => /\d/.test(value) },
  {
    id: "symbol",
    label: "One symbol (!@#$)",
    hint: "a symbol",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
    optional: true,
  },
];

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return "Email is required";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address (e.g. name@example.com)";
  }
  return "";
}

export function validateRequiredPassword(value) {
  return value ? "" : "Password is required";
}

/** Required rules only; the symbol rule just raises the strength score. */
export function validateNewPassword(value) {
  if (!value) return "Password is required";
  const failed = PASSWORD_RULES.find((rule) => !rule.optional && !rule.test(value));
  return failed ? "Password must include an uppercase letter, a lowercase letter and a number (8-64 characters)" : "";
}

export function validateFullName(value) {
  const name = value.trim();
  if (!name) return "Full name is required";
  if (name.length < 2 || name.length > 100) return "Full name must be 2-100 characters";
  if (!FULL_NAME_PATTERN.test(name)) return "Full name can contain only letters, spaces, . ' and -";
  return "";
}

export function validateSriLankaMobile(value) {
  if (!value.trim()) return "Mobile number is required";
  return SRI_LANKA_MOBILE_PATTERN.test(value.trim()) ? "" : "Enter a valid Sri Lankan mobile number";
}

/** 0-4 strength score and label for the strength meter. */
export function passwordStrength(value) {
  if (!value) return { score: 0, label: "" };
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const labels = ["Weak", "Weak", "Fair", "Strong", "Very strong"];
  return { score: passed, label: labels[passed] };
}

/** Hides most of the local part, e.g. kamal.perera@gmail.com -> k••••a@gmail.com */
export function maskEmail(value) {
  const [local, domain] = value.trim().split("@");
  if (!domain) return value;
  if (local.length <= 2) return `${local[0] || ""}•@${domain}`;
  return `${local[0]}${"•".repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}@${domain}`;
}
