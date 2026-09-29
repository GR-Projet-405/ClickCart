import React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Briefcase, Check, Loader2, ReceiptText, ShieldCheck, User, X } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import { homePathForRole, useAuth } from "../../context/AuthContext";
import { checkEmailAvailability } from "../../services/authService";
import AuthAlert from "./components/AuthAlert";
import AuthField from "./components/AuthField";
import ChoiceCards from "./components/ChoiceCards";
import PasswordField from "./components/PasswordField";
import PasswordStrength from "./components/PasswordStrength";
import {
  validateEmail,
  validateFullName,
  validateNewPassword,
  validateSriLankaMobile,
} from "./validation";
import "./auth.css";

const ROLE_OPTIONS = [
  { value: "CUSTOMER", label: "Customer", description: "Book trusted local services near you.", icon: User },
  {
    value: "SERVICE_PROVIDER",
    label: "Service Provider",
    description: "Offer your skills and grow your business.",
    icon: Briefcase,
  },
];

const PROVIDER_TYPE_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individual", description: "I work on my own. NIC verification later." },
  { value: "BUSINESS", label: "Business", description: "Registered company with a team." },
];

const PANEL = {
  SERVICE_PROVIDER: {
    title: "Why providers choose ClickCart",
    items: [
      { icon: BadgeCheck, title: "Verified badge", text: "ID and skill checks build instant trust with customers." },
      { icon: ReceiptText, title: "Clear earnings", text: "See gross, commission and net earnings for every job." },
      { icon: ShieldCheck, title: "Secure by default", text: "Sessions expire automatically and every login is logged." },
    ],
  },
  CUSTOMER: {
    title: "Why customers choose ClickCart",
    items: [
      { icon: BadgeCheck, title: "Verified providers", text: "Providers are checked before they can take bookings." },
      { icon: ReceiptText, title: "Clear pricing", text: "Compare prices, availability and reviews before you book." },
      { icon: ShieldCheck, title: "Secure by default", text: "Sessions expire automatically and every login is logged." },
    ],
  },
};

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

/** Accepts "77 123 4567", "0771234567" or "+94771234567" in the local field and returns "+94 ...". */
function toInternationalPhone(localValue) {
  const local = localValue.trim().replace(/^(\+94|0)/, "").trim();
  return `+94 ${local}`;
}

/**
 * DEV-01 Register page (role choice + provider type + live password rules).
 * Admin accounts are never created here; they are provisioned internally.
 */
export default function RegisterPage() {
  const { register, status, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(location.state?.role === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "CUSTOMER");
  const [providerType, setProviderType] = useState("");
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState("idle");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const alertRef = useRef(null);

  // Live "Available" check, 500 ms after typing stops; stale requests are cancelled.
  useEffect(() => {
    const email = values.email.trim();
    if (!email || validateEmail(email)) {
      setEmailStatus("idle");
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setEmailStatus("checking");
      try {
        const available = await checkEmailAvailability(email, controller.signal);
        setEmailStatus(available ? "available" : "taken");
      } catch (error) {
        if (error.name !== "AbortError") setEmailStatus("idle");
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [values.email]);

  useEffect(() => {
    if (failure) alertRef.current?.focus();
  }, [failure]);

  if (status === "authenticated" && user && !submitting) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  const updateField = (name) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  };

  const fieldError = (name, current = values) => {
    switch (name) {
      case "fullName":
        return validateFullName(current.fullName);
      case "phone":
        return current.phone.trim() ? validateSriLankaMobile(toInternationalPhone(current.phone)) : "Mobile number is required";
      case "email":
        return validateEmail(current.email);
      case "password":
        return validateNewPassword(current.password);
      case "confirmPassword":
        if (!current.confirmPassword) return "Confirm your password";
        return current.confirmPassword === current.password ? "" : "Passwords do not match";
      case "acceptedTerms":
        return current.acceptedTerms ? "" : "You must accept the Terms of Service and Privacy Policy";
      default:
        return "";
    }
  };

  const validateOnBlur = (name) => (event) => {
    if (event.relatedTarget?.type === "submit" || !values[name]) return;
    setErrors((current) => ({ ...current, [name]: fieldError(name) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    ["fullName", "phone", "email", "password", "confirmPassword", "acceptedTerms"].forEach((name) => {
      nextErrors[name] = fieldError(name);
    });
    if (role === "SERVICE_PROVIDER" && !providerType) nextErrors.providerType = "Choose a provider type";
    if (!nextErrors.email && emailStatus === "taken") nextErrors.email = "An account with this email already exists";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      // Wait for React to render the error state, then move focus to the first problem.
      setTimeout(() => {
        const first = document.querySelector(".auth-form [aria-invalid='true'], .auth-form .auth-choices--invalid input");
        first?.focus();
      }, 0);
      return;
    }

    setSubmitting(true);
    setFailure(null);
    try {
      const created = await register({
        role,
        providerType: role === "SERVICE_PROVIDER" ? providerType : null,
        fullName: values.fullName.trim(),
        phone: toInternationalPhone(values.phone),
        email: values.email.trim(),
        password: values.password,
        acceptedTerms: values.acceptedTerms,
      });
      // New providers continue to profile setup (DEV-03); customers go to the marketplace.
      const next = created.role === "SERVICE_PROVIDER" ? "/provider/profile/setup" : homePathForRole(created.role);
      navigate(next, { replace: true });
    } catch (error) {
      setSubmitting(false);
      if (error.status === 409) {
        setEmailStatus("taken");
        setErrors((current) => ({ ...current, email: "An account with this email already exists" }));
      } else if (error.fieldErrors) {
        setErrors((current) => ({ ...current, ...error.fieldErrors }));
      } else if (error.code === "RATE_LIMITED") {
        setFailure({ title: "Too many sign-up attempts", detail: "Please wait a few minutes and try again." });
      } else {
        setFailure({ title: "We couldn't create your account", detail: error.message });
      }
    }
  };

  const passwordsMatch = Boolean(values.confirmPassword) && values.confirmPassword === values.password;
  const panel = PANEL[role];

  return (
    <AuthLayout
      panelSide="right"
      topBarLinks={
        <Link to="/login" className="auth-topbar__keep">
          Already a member? Log in
        </Link>
      }
      panel={
        <>
          <h2 className="auth-panel__heading">{panel.title}</h2>
          <ul className="auth-panel__features">
            {panel.items.map(({ icon: Icon, title, text }) => (
              <li key={title} className="auth-panel__feature">
                <Icon size={20} aria-hidden="true" />
                <div>
                  <p className="auth-panel__feature-title">{title}</p>
                  <p className="auth-panel__feature-text">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <div className="auth-page">
        <header className="auth-page__header">
          <h1 className="auth-page__title">Create your account</h1>
          <p className="auth-page__subtitle">Takes about two minutes. You can add your services later.</p>
        </header>

        <div ref={alertRef} tabIndex={-1} className="auth-page__alerts">
          {failure && (
            <AuthAlert variant="error" title={failure.title}>
              {failure.detail}
            </AuthAlert>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <ChoiceCards
            name="role"
            legend="I am signing up as"
            legendNote="Admin accounts are provisioned internally"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(next) => {
              setRole(next);
              setErrors((current) => ({ ...current, providerType: "" }));
            }}
          />

          {role === "SERVICE_PROVIDER" && (
            <div className="auth-provider-type">
              <ChoiceCards
                name="providerType"
                variant="compact"
                legend="Provider type"
                legendNote="Required"
                options={PROVIDER_TYPE_OPTIONS}
                value={providerType}
                onChange={(next) => {
                  setProviderType(next);
                  setErrors((current) => ({ ...current, providerType: "" }));
                }}
                error={errors.providerType}
              />
              <p className="auth-provider-type__note">
                Business registration and identity documents are collected later in <strong>Provider Verification</strong>,
                not at sign-up.
              </p>
            </div>
          )}

          <div className="auth-form__row">
            <AuthField
              id="register-name"
              label="Full name"
              autoComplete="name"
              placeholder="Kamal Perera"
              value={values.fullName}
              onChange={updateField("fullName")}
              onBlur={validateOnBlur("fullName")}
              error={errors.fullName}
              aria-required="true"
            />
            <AuthField
              id="register-phone"
              label="Mobile number"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              placeholder="77 123 4567"
              prefix="+94"
              value={values.phone}
              onChange={updateField("phone")}
              onBlur={validateOnBlur("phone")}
              error={errors.phone}
              aria-required="true"
            />
          </div>

          <AuthField
            id="register-email"
            label="Email address"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={updateField("email")}
            onBlur={validateOnBlur("email")}
            error={errors.email}
            aria-required="true"
            trailing={
              <span aria-live="polite">
                <EmailStatus status={emailStatus} />
              </span>
            }
          />
          {emailStatus === "taken" && (
            <p className="auth-inline-hint">
              Already have an account?{" "}
              <Link className="auth-link" to="/login" state={{ email: values.email }}>
                Log in instead
              </Link>
            </p>
          )}

          <div className="auth-password-group">
            <PasswordField
              id="register-password"
              label="Password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={values.password}
              onChange={updateField("password")}
              onBlur={validateOnBlur("password")}
              error={errors.password}
              aria-required="true"
            />
            <PasswordStrength password={values.password} />
          </div>

          <PasswordField
            id="register-confirm-password"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={updateField("confirmPassword")}
            onBlur={validateOnBlur("confirmPassword")}
            error={errors.confirmPassword}
            valid={passwordsMatch}
            aria-required="true"
            trailingExtra={passwordsMatch ? <Check size={18} className="auth-input__match" aria-hidden="true" /> : null}
          />

          <div>
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={values.acceptedTerms}
                onChange={updateField("acceptedTerms")}
                aria-invalid={Boolean(errors.acceptedTerms)}
                aria-describedby={errors.acceptedTerms ? "register-terms-error" : undefined}
              />
              <span>
                I agree to the{" "}
                <a className="auth-link" href="#terms">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="auth-link" href="#privacy">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.acceptedTerms && (
              <p id="register-terms-error" className="auth-choices__error" role="alert">
                {errors.acceptedTerms}
              </p>
            )}
          </div>

          <Button type="submit" className="auth-submit" size="lg" loading={submitting} rightIcon={<ArrowRight />}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="auth-page__subtitle auth-page__footer">
          Already a member?{" "}
          <Link className="auth-link" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function EmailStatus({ status }) {
  if (status === "checking") {
    return (
      <span className="auth-input__status auth-input__status--muted">
        <Loader2 size={14} className="auth-spin" aria-hidden="true" /> Checking
      </span>
    );
  }
  if (status === "available") {
    return (
      <span className="auth-input__status auth-input__status--ok">
        <Check size={14} aria-hidden="true" /> Available
      </span>
    );
  }
  if (status === "taken") {
    return (
      <span className="auth-input__status auth-input__status--bad">
        <X size={14} aria-hidden="true" /> Taken
      </span>
    );
  }
  return null;
}
