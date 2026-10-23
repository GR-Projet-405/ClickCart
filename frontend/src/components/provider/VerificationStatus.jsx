import { Link } from "react-router-dom";
import { useProvider } from "../../context/ProviderContext";
import "./ProviderVerificationForm.css";
export default function VerificationStatus({ onContinue }) {
  const { verification, verificationError, verificationLoading } = useProvider();
  const status = verification?.status || "NOT_STARTED";
  const labels = { NOT_STARTED: "Verify your provider account", DRAFT: "Complete your verification", PENDING: "Verification under review", APPROVED: "Provider verified", REJECTED: "Verification needs changes" };
  const actionable = ["NOT_STARTED", "DRAFT", "REJECTED"].includes(status);
  return <section className={`provider-verification-status status-${status.toLowerCase()}`} aria-label="Provider verification">
    <div><h2>{verificationLoading ? "Loading verification status…" : labels[status] || status}</h2>
    {verificationError ? <p role="alert">{verificationError} <button onClick={() => window.dispatchEvent(new Event("provider_verification_updated"))}>Retry</button></p> : <>
    <p>{status === "APPROVED" ? "Your identity documents have been approved." : status === "PENDING" ? "Your documents were submitted. Your status will update after an administrator reviews them." : "Submit both sides of your NIC. Business accounts also need a business registration certificate."}</p>
    {status === "REJECTED" && <p>{[...(verification?.rejectionReasons || []), verification?.rejectionComments].filter(Boolean).join(" · ")}</p>}</>}
    </div>{!verificationLoading && !verificationError && actionable && (onContinue ? <button className="submit-btn" onClick={onContinue}>{status === "REJECTED" ? "Update and resubmit" : "Submit verification"}</button> : <Link className="submit-btn" to="/provider/verification">{status === "REJECTED" ? "Update and resubmit" : "Submit verification"}</Link>)}
    {!verificationLoading && !verificationError && status === "APPROVED" && <Link className="submit-btn" to="/provider/dashboard">Open dashboard</Link>}
    {!verificationLoading && status !== "APPROVED" && <p>Administrator approval is required before you can publish services, accept bookings or use provider work features. You can still update your profile and submit verification documents.</p>}
  </section>;
}
