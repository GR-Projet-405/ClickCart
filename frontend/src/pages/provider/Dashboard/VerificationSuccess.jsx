import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";

import "./Verification.css";

export default function VerificationSuccess() {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        // Navigate back to the dashboard when the button is clicked
        navigate("/provider/dashboard");
    };

    return (
        <PageContainer className="cc-verification-page">
            <Card variant="default" padding="lg" className="cc-success-card">
                <div className="cc-success-content">

                    {/* Green Tick Icon */}
                    <div className="cc-success-icon-wrapper">
                        <div className="cc-success-icon">
                            <Check size={48} strokeWidth={4} />
                        </div>
                    </div>

                    <h2 className="cc-success-title">Documents Submitted<br />Successfully!</h2>

                    <p className="cc-success-description">
                        Your Details and Documents have been sent to our administration team for review.
                        This process typically takes up to 24-48 hours. We will notify you once approved.
                    </p>

                    <Button variant="primary" size="lg" onClick={handleGoToDashboard}>
                        Go to Dashboard
                    </Button>

                </div>
            </Card>
        </PageContainer>
    );
}