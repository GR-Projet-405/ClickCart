import React, { useState } from "react";
import ProviderVerificationStep1 from "./ProviderVerificationStep1";
import ProviderVerificationStepTwo from "./ProviderVerificationStepTwo";
import ProviderVerificationSuccess from "./ProviderVerificationSuccess";
import { useAuth } from "../../context/AuthContext";

export default function ProviderVerification() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("INDIVIDUAL");
  const { user } = useAuth();

  const getInitialUserId = () => {
    if (user) {
      if (typeof user === "string") return user;
      if (typeof user === "object") return user.id || user._id || user.userId || null;
    }
    return null;
  };

  const [providerId, setProviderId] = useState(getInitialUserId);

  const handleStepOneSuccess = (savedId, selectedAccountType) => {
    if (savedId) {
      setProviderId(savedId);
    }
    if (selectedAccountType) {
      setAccountType(selectedAccountType);
    }
    setStep(2);
  };

  return (
    <div>
      {step === 1 && (
        <ProviderVerificationStep1
          onNext={(savedId, type) => handleStepOneSuccess(savedId, type)}
        />
      )}

      {step === 2 && (
        <ProviderVerificationStepTwo
          userId={providerId}
          accountType={accountType}
          onBack={() => setStep(1)}
          onSuccess={() => setStep(3)} 
        />
      )}

      {step === 3 && <ProviderVerificationSuccess />}
    </div>
  );
}