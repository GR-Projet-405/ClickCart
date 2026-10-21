import { useState } from "react";
import ProviderVerificationStep1 from "./ProviderVerificationStep1";
import ProviderVerificationStepTwo from "./ProviderVerificationStepTwo";
import VerificationStatus from "./VerificationStatus";
import { useProvider } from "../../context/ProviderContext";
export default function ProviderVerification() {
  const { verification, user } = useProvider();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState("INDIVIDUAL");
  const refresh = () => window.dispatchEvent(new Event("provider_verification_updated"));
  return <div><VerificationStatus onContinue={() => setStep(1)} />
    {step === 1 && <ProviderVerificationStep1 initialData={verification} onNext={(_id, type) => { setAccountType(type); refresh(); setStep(2); }} />}
    {step === 2 && <ProviderVerificationStepTwo userId={user.id} accountType={accountType} onBack={() => setStep(1)} onSuccess={() => { refresh(); setStep(0); }} />}
  </div>;
}
