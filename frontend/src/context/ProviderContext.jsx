import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homePathForRole } from "./AuthContext";
import { getProviderProfile } from "../services/providerProfileService";
import { providerVerificationService } from "../services/providerVerificationService";
import Spinner from "../components/common/Spinner";
const ProviderContext = createContext(null);
export const useProvider = () => useContext(ProviderContext);
function ProviderSession({ children, user }) {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = () => getProviderProfile().then(data => {
      if (active) setProfile(data);
    }).catch(() => { if (active) setProfile(null); });
    const loadVerification = () => providerVerificationService.getByUserId().then(data => { if (active) { setVerification(data); setVerificationError(""); } }).catch(err => { if (active) { setVerification(null); setVerificationError(err.message); } }).finally(() => { if (active) setVerificationLoading(false); });
    loadVerification();
    window.addEventListener("provider_verification_updated", loadVerification);
    window.addEventListener("focus", loadVerification);
    load();
    window.addEventListener("provider_profile_updated", load);
    return () => { active = false; window.removeEventListener("provider_verification_updated", loadVerification); window.removeEventListener("focus", loadVerification); window.removeEventListener("provider_profile_updated", load); };
  }, []);
  const displayName = (profile?.providerType === "business" ? profile.businessName || profile.contactPerson : profile?.fullName)
    || user.fullName || user.email || "Your account";
  const onboarding = /^\/provider\/(verification|profile(?:\/.*)?|settings)\/?$/.test(location.pathname);
  let content = children;
  if (!onboarding) {
    if (verificationLoading) content = <div role="status"><Spinner /><p>Checking provider verification…</p></div>;
    else if (verification?.status !== "APPROVED") content = <Navigate to="/provider/verification" replace />;
  }
  return <ProviderContext.Provider value={{ profile, displayName, user, verification, verificationError, verificationLoading }}>{content}</ProviderContext.Provider>;
}
export default function ProviderGuard({ children }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <div className="provider-session-loading" role="status"><Spinner /><p>Restoring your account…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== "SERVICE_PROVIDER") return <Navigate to={homePathForRole(user.role)} replace />;
  return <ProviderSession key={user.id} user={user}>{children}</ProviderSession>;
}
