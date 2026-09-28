import React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import { canReturnTo, homePathForRole, useAuth } from "../../context/AuthContext";
import AuthAlert from "./components/AuthAlert";
import AuthField from "./components/AuthField";
import PasswordField from "./components/PasswordField";
import RoleToggle from "./components/RoleToggle";
import useCountdown, { formatCountdown } from "./hooks/useCountdown";
import { validateEmail, validateRequiredPassword } from "./validation";
import "./auth.css";

const ROLE_OPTIONS = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "SERVICE_PROVIDER", label: "Service Provider" },
];

const ROLE_HINTS = {
  CUSTOMER: "Book and manage trusted local services.",
  SERVICE_PROVIDER: "Manage your services, jobs and earnings.",
};

/**
 * DEV-01 Login page (mockups 1a / 1b).
 * The Customer / Service Provider tab only changes the copy: where the user lands after login is
 * decided by the role in the verified token, never by the client.
 */
export default function LoginPage() {
  const { login, status, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [portal, setPortal] = useState("CUSTOMER");
  const [values, setValues] = useState({ email: location.state?.email || "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [retryAt, setRetryAt] = useState(null);
  const alertRef = useRef(null);

  const lockSeconds = useCountdown(lockedUntil);
  const retrySeconds = useCountdown(retryAt);
  const isLocked = Boolean(lockedUntil) && lockSeconds > 0;
  const isRateLimited = Boolean(retryAt) && retrySeconds > 0;

  useEffect(() => {
    if (lockedUntil && lockSeconds === 0) setLockedUntil(null);
  }, [lockedUntil, lockSeconds]);

  useEffect(() => {
    if (failure || isLocked) alertRef.current?.focus();
  }, [failure, isLocked]);

  // Already signed in (e.g. session restored from the cookie): go straight to the workspace.
  if (status === "authenticated" && user && !submitting) {
    return <Navigate to={landingPath(user.role, location.state?.from)} replace />;
  }

  const updateField = (name) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateField = (name) => (event) => {
    // Moving focus to the submit button: submit validates everything, and showing the message now
    // would shift the button away from the pointer before the click lands.
    if (event.relatedTarget?.type === "submit") return;
    const message = name === "email" ? validateEmail(values.email) : validateRequiredPassword(values.password);
    setErrors((current) => ({ ...current, [name]: message }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(values.email),
      password: validateRequiredPassword(values.password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    setFailure(null);
    try {
      const signedIn = await login(values);
      navigate(landingPath(signedIn.role, location.state?.from), { replace: true });
    } catch (error) {
      handleError(error);
      setSubmitting(false);
    }
  };

  const handleError = (error) => {
    setValues((current) => ({ ...current, password: "" }));
    switch (error.code) {
      case "ACCOUNT_LOCKED":
        setLockedUntil(error.lockedUntil);
        break;
      case "RATE_LIMITED":
        setRetryAt(Date.now() + (error.retryAfterSeconds || 60) * 1000);
        break;
      case "INVALID_CREDENTIALS":
        setFailure({
          title: "Incorrect email or password",
          detail: error.attemptsRemaining
            ? `${error.attemptsRemaining} ${error.attemptsRemaining === 1 ? "attempt" : "attempts"} left before your account is temporarily locked for 15 minutes.`
            : "Check your details and try again.",
        });
        break;
      default:
        if (error.fieldErrors) {
          setErrors(error.fieldErrors);
        } else {
          setFailure({ title: "We couldn't log you in", detail: error.message });
        }
    }
  };

  const goToReset = () => navigate("/forgot-password", { state: { email: values.email } });

  return (
    <AuthLayout
      topBarLinks={
        <>
          <Link to="/register" state={{ role: "SERVICE_PROVIDER" }}>Become a Provider</Link>
          <a href="#help-center">Help Center</a>
        </>
      }
      panel={
        <>
          <h2 className="auth-panel__headline">Welcome back to your workspace.</h2>
          <p className="auth-panel__lead">
            Sign in to manage bookings, track earnings and reply to customers — all in one secure place.
          </p>
          <p className="auth-panel__trust">
            <ShieldCheck size={20} aria-hidden="true" />
            Protected by encrypted connections and short-lived, token-based sessions.
          </p>
        </>
      }
    >
      <div className="auth-page">
        <header className="auth-page__header">
          <p className="auth-page__eyebrow">Sign in</p>
          <h1 className="auth-page__title">Log in to ClickCart</h1>
          <p className="auth-page__subtitle">
            New here?{" "}
            <Link className="auth-link" to="/register" state={{ role: portal }}>
              Create an account
            </Link>
          </p>
        </header>

        <RoleToggle label="I am signing in as" options={ROLE_OPTIONS} value={portal} onChange={setPortal} />
        <p className="auth-role-toggle__hint">{ROLE_HINTS[portal]}</p>

        <div ref={alertRef} tabIndex={-1} className="auth-page__alerts">
          {isLocked && (
            <AuthAlert
              variant="warning"
              title="Account temporarily locked"
              action={
                <button type="button" className="auth-alert-button" onClick={goToReset}>
                  Reset password
                </button>
              }
            >
              Too many failed attempts. Try again in <strong>{formatCountdown(lockSeconds)}</strong> or reset your
              password to unlock it now.
            </AuthAlert>
          )}
          {!isLocked && isRateLimited && (
            <AuthAlert variant="warning" title="Too many attempts">
              Please wait <strong>{formatCountdown(retrySeconds)}</strong> before trying again.
            </AuthAlert>
          )}
          {!isLocked && !isRateLimited && failure && (
            <AuthAlert variant="error" title={failure.title}>
              {failure.detail}
            </AuthAlert>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthField
            id="login-email"
            label="Email address"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            icon={<Mail />}
            value={values.email}
            onChange={updateField("email")}
            onBlur={values.email ? validateField("email") : undefined}
            error={errors.email}
            aria-required="true"
          />

          <PasswordField
            id="login-password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock />}
            value={values.password}
            onChange={updateField("password")}
            error={errors.password}
            aria-required="true"
            labelAction={
              <Link className="auth-link" to="/forgot-password" state={{ email: values.email }}>
                Forgot password?
              </Link>
            }
          />

          <label className="auth-checkbox">
            <input type="checkbox" checked={values.rememberMe} onChange={updateField("rememberMe")} />
            <span>Keep me signed in for 30 days</span>
          </label>

          <Button
            type="submit"
            className="auth-submit"
            size="lg"
            loading={submitting}
            disabled={isLocked || isRateLimited}
            rightIcon={<ArrowRight />}
          >
            {submitting ? "Verifying..." : "Log in"}
          </Button>
        </form>

        <div className="auth-divider">or continue with</div>
        <div className="auth-social">
          <button type="button" className="auth-social__button" disabled aria-describedby="social-note">
            Google <span className="auth-social__soon">Soon</span>
          </button>
          <button type="button" className="auth-social__button" disabled aria-describedby="social-note">
            Facebook <span className="auth-social__soon">Soon</span>
          </button>
        </div>
        <p id="social-note" className="auth-social__note">
          Social sign-in is coming soon.
        </p>
      </div>
    </AuthLayout>
  );
}

function landingPath(role, from) {
  const requested = from?.pathname;
  return canReturnTo(role, requested) ? requested : homePathForRole(role);
}
