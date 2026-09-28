import React from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { requestPasswordReset, resetPassword, verifyResetCode } from "../../services/authService";
import AuthAlert from "./components/AuthAlert";
import AuthField from "./components/AuthField";
import OtpInput from "./components/OtpInput";
import PasswordField from "./components/PasswordField";
import PasswordStrength from "./components/PasswordStrength";
import StepIndicator from "./components/StepIndicator";
import useCountdown, { formatCountdown } from "./hooks/useCountdown";
import { validateEmail, validateNewPassword } from "./validation";
import "./auth.css";

const STEPS = ["Email", "Verify code", "New password"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "27 Sep 2026, 09:47" in the user's local time. */
function formatChangedAt(date) {
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${time}`;
}

/**
 * DEV-01 password recovery (mockups 1d, 1e, 1f): Email -> 6-digit code -> New password -> Done.
 * The email and single-use reset token live only in component state, never in the URL.
 */
export default function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, logout } = useAuth();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const [notice, setNotice] = useState("");

  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [resendAt, setResendAt] = useState(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [otpKey, setOtpKey] = useState(0);

  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changedAt, setChangedAt] = useState(null);

  const codeSeconds = useCountdown(codeExpiresAt);
  const resendSeconds = useCountdown(resendAt);
  const codeExpired = step === "code" && Boolean(codeExpiresAt) && codeSeconds === 0;
  const headingRef = useRef(null);

  // Move focus to the new heading whenever the step changes (screen readers announce it).
  // The code step instead focuses the first digit box (OtpInput autoFocus).
  useEffect(() => {
    if (step !== "code") headingRef.current?.focus();
  }, [step]);

  const startTimers = (data) => {
    setCodeExpiresAt(Date.now() + (data?.codeExpiresInSeconds ?? 600) * 1000);
    setResendAt(Date.now() + (data?.resendAvailableInSeconds ?? 60) * 1000);
  };

  const showRequestError = (error) => {
    if (error.code === "RATE_LIMITED") {
      setFailure({ title: "Too many requests", detail: `Please wait ${formatCountdown(error.retryAfterSeconds || 60)} and try again.` });
    } else if (error.fieldErrors?.email) {
      setEmailError(error.fieldErrors.email);
    } else {
      setFailure({ title: "Something went wrong", detail: error.message });
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    const message = validateEmail(email);
    setEmailError(message);
    if (message) return;

    setSubmitting(true);
    setFailure(null);
    try {
      startTimers(await requestPasswordReset(email));
      setCode("");
      setCodeError("");
      setOtpKey((key) => key + 1);
      setStep("code");
    } catch (error) {
      showRequestError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setFailure(null);
    setNotice("");
    try {
      startTimers(await requestPasswordReset(email));
      setCode("");
      setCodeError("");
      setOtpKey((key) => key + 1);
      setNotice("We sent a new code. Codes you received earlier no longer work.");
    } catch (error) {
      showRequestError(error);
    }
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    if (code.length !== 6 || codeExpired) return;

    setSubmitting(true);
    setFailure(null);
    setNotice("");
    try {
      const data = await verifyResetCode(email, code);
      setResetToken(data.resetToken);
      setStep("password");
    } catch (error) {
      if (error.code === "INVALID_RESET_CODE") {
        setCodeError("That code is incorrect or has expired. Request a new one.");
      } else {
        showRequestError(error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordRuleError = password ? validateNewPassword(password) : "";
  const mismatch = Boolean(confirm) && confirm !== password;
  const canUpdate = Boolean(password) && !passwordRuleError && Boolean(confirm) && !mismatch;

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!canUpdate) return;

    setSubmitting(true);
    setFailure(null);
    try {
      const data = await resetPassword(resetToken, password);
      setChangedAt(new Date(data.changedAt));
      setResetToken("");
      setPassword("");
      setConfirm("");
      // The server revoked every session; also drop this tab's in-memory session if there was one.
      if (status === "authenticated") await logout().catch(() => {});
      setStep("done");
    } catch (error) {
      if (error.code === "PASSWORD_REUSED") {
        setPasswordError(error.message);
      } else if (error.fieldErrors?.newPassword) {
        setPasswordError(error.fieldErrors.newPassword);
      } else if (error.code === "RESET_SESSION_EXPIRED") {
        setFailure({ title: "Your reset session has expired", detail: "Please start again to get a new code.", restart: true });
      } else {
        showRequestError(error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setFailure(null);
    setNotice("");
    setResetToken("");
    setStep("email");
  };

  const stepIndex = { email: 0, code: 1, password: 2 }[step];

  return (
    <AuthLayout
      topBarLinks={
        <Link to="/login" className="auth-topbar__keep">
          Back to log in
        </Link>
      }
      panel={
        <>
          <h2 className="auth-panel__headline">Locked out? We&apos;ve got you.</h2>
          <p className="auth-panel__lead">
            Reset your password in three quick steps. Your code is valid for 10 minutes and works only once.
          </p>
          <p className="auth-panel__trust">
            <ShieldCheck size={20} aria-hidden="true" />
            For your safety, a password reset signs you out on every device.
          </p>
        </>
      }
    >
      <div className="auth-page">
        {step === "email" && (
          <>
            <header className="auth-page__header">
              <span className="auth-icon-tile" aria-hidden="true">
                <Mail size={24} />
              </span>
              <h1 className="auth-page__title" ref={headingRef} tabIndex={-1}>
                Forgot your password?
              </h1>
              <p className="auth-page__subtitle">
                Enter the email linked to your ClickCart account and we&apos;ll send you a 6-digit code. The code
                expires in 10 minutes.
              </p>
            </header>
            {failure && <AuthAlert title={failure.title}>{failure.detail}</AuthAlert>}
            <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
              <AuthField
                id="reset-email"
                label="Email address"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError("");
                }}
                error={emailError}
                aria-required="true"
              />
              <Button type="submit" className="auth-submit" size="lg" loading={submitting}>
                {submitting ? "Sending code..." : "Send code"}
              </Button>
            </form>
            <BackToLogin email={email} />
          </>
        )}

        {step === "code" && (
          <>
            <StepIndicator steps={STEPS} current={stepIndex} />
            <header className="auth-page__header">
              <h1 className="auth-page__title" ref={headingRef} tabIndex={-1}>
                Enter verification code
              </h1>
              <p className="auth-page__subtitle">
                If an account exists for <strong className="auth-strong">{email.trim()}</strong>, we sent it a 6-digit
                code. It is valid for 10 minutes.
              </p>
            </header>
            {failure && <AuthAlert title={failure.title}>{failure.detail}</AuthAlert>}
            {notice && <AuthAlert variant="success">{notice}</AuthAlert>}
            <form className="auth-form" onSubmit={handleCodeSubmit} noValidate>
              <OtpInput
                key={otpKey}
                autoFocus
                invalid={Boolean(codeError)}
                describedBy={codeError ? "reset-code-error" : "reset-code-timer"}
                onChange={(value) => {
                  setCode(value);
                  if (codeError) setCodeError("");
                }}
              />
              {codeError && (
                <p id="reset-code-error" className="auth-choices__error" role="alert">
                  {codeError}
                </p>
              )}
              <div className="auth-code-meta">
                <span id="reset-code-timer">
                  {codeExpired ? (
                    <span className="auth-code-meta__expired">Code expired. Request a new one.</span>
                  ) : (
                    <>
                      Code expires in <strong>{formatCountdown(codeSeconds)}</strong>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  className="auth-text-button"
                  onClick={handleResend}
                  disabled={resendSeconds > 0}
                >
                  {resendSeconds > 0 ? `Resend in ${formatCountdown(resendSeconds)}` : "Resend code"}
                </button>
              </div>
              <Button
                type="submit"
                className="auth-submit"
                size="lg"
                loading={submitting}
                disabled={code.length !== 6 || codeExpired}
              >
                {submitting ? "Verifying..." : "Verify & continue"}
              </Button>
            </form>
            <button type="button" className="auth-text-button auth-back" onClick={restart}>
              <ArrowLeft size={16} aria-hidden="true" /> Use a different email
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <StepIndicator steps={STEPS} current={stepIndex} />
            <header className="auth-page__header">
              <h1 className="auth-page__title" ref={headingRef} tabIndex={-1}>
                Set a new password
              </h1>
              <p className="auth-page__subtitle">
                Choose a password you haven&apos;t used before. You&apos;ll be signed out of all other devices.
              </p>
            </header>
            {failure && (
              <AuthAlert
                title={failure.title}
                action={
                  failure.restart && (
                    <button type="button" className="auth-alert-button" onClick={restart}>
                      Start again
                    </button>
                  )
                }
              >
                {failure.detail}
              </AuthAlert>
            )}
            <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
              <div className="auth-password-group">
                <PasswordField
                  id="reset-new-password"
                  label="New password"
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  error={passwordError}
                  aria-required="true"
                />
                <PasswordStrength password={password} showRules={false} />
              </div>
              <PasswordField
                id="reset-confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                placeholder="Re-enter the new password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                error={mismatch ? "Passwords do not match" : ""}
                valid={Boolean(confirm) && !mismatch}
                aria-required="true"
              />
              <Button type="submit" className="auth-submit" size="lg" loading={submitting} disabled={!canUpdate}>
                {submitting ? "Updating..." : "Update password"}
              </Button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="auth-success">
            <span className="auth-success__badge" aria-hidden="true">
              <Check size={36} strokeWidth={3} />
            </span>
            <h1 className="auth-page__title" ref={headingRef} tabIndex={-1}>
              Password updated
            </h1>
            <p className="auth-page__subtitle">
              Your password was changed on <strong className="auth-strong">{formatChangedAt(changedAt)}</strong>.
              <br />
              Other devices have been signed out.
            </p>
            <Button
              className="auth-submit"
              size="lg"
              leftIcon={<KeyRound />}
              onClick={() => navigate("/login", { replace: true, state: { email: email.trim() } })}
            >
              Log in with new password
            </Button>
            <p className="auth-page__subtitle">
              Didn&apos;t request this?{" "}
              <a className="auth-link" href="#support">
                Contact support
              </a>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

function BackToLogin({ email }) {
  return (
    <Link className="auth-text-button auth-back" to="/login" state={{ email }}>
      <ArrowLeft size={16} aria-hidden="true" /> Back to log in
    </Link>
  );
}
