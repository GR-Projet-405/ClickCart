import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";

import "./Verification.css";

export default function VerificationStep1() {
    const navigate = useNavigate();
    // State to manage the toggle between individual and business
    const [providerType, setProviderType] = useState("individual");

    const handleNext = (e) => {
        e.preventDefault();
        // Navigate to Step 2 when the form is submitted
        navigate("/provider/verification/step-2");
    };

    return (
        <PageContainer className="cc-verification-page">
            <Card variant="default" padding="lg" className="cc-verification-card">

                <h2 className="cc-verification-title">provider Verification Form</h2>

                {/* Toggle Switch */}
                <div className="cc-type-toggle">
                    <button
                        type="button"
                        className={`cc-type-btn ${providerType === "individual" ? "active" : ""}`}
                        onClick={() => setProviderType("individual")}
                    >
                        individual
                    </button>
                    <button
                        type="button"
                        className={`cc-type-btn ${providerType === "business" ? "active" : ""}`}
                        onClick={() => setProviderType("business")}
                    >
                        Business
                    </button>
                </div>

                {/* Progress Stepper */}
                <div className="cc-stepper">
                    <div className="cc-step active">
                        <div className="cc-step-circle">1</div>
                    </div>
                    <div className="cc-step-line"></div>
                    <div className="cc-step">
                        <div className="cc-step-circle">2</div>
                    </div>
                </div>

                {/* Form Fields based on selection */}
                <form onSubmit={handleNext} className="cc-verification-form">
                    {providerType === "individual" ? (
                        <>
                            <h3 className="cc-form-section-title">Account Details & Verification</h3>
                            <div className="cc-form-grid">
                                <Input id="fullName" label="Full Name" placeholder="e.g., Dissanayakage Nimal Perera" required />
                                <Input id="nic" label="National ID Number(NIC)" placeholder="e.g., 123456789874" required />
                                <Input id="personalAddress" label="Personal Address" placeholder="e.g., No;78, 123 street, colombo 3" required />
                                <Input id="contactNumber" label="Contact Number" placeholder="e.g., +94 123 456 789" required />
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="cc-form-section-title">Personal Details</h3>
                            <div className="cc-form-grid">
                                <Input id="fullName" label="Full Name" placeholder="e.g., Dissanayakage Nimal Perera" required />
                                <Input id="nic" label="National ID Number(NIC)" placeholder="e.g., 123456789874" required />
                                <Input id="personalAddress" label="Personal Address" placeholder="e.g., No;78, 123 street, colombo 3" required />
                                <Input id="contactNumber" label="Contact Number" placeholder="e.g., +94 123 456 789" required />
                            </div>

                            <h3 className="cc-form-section-title cc-margin-top">Business Details</h3>
                            <div className="cc-form-grid">
                                <Input id="businessName" label="Business Name" placeholder="e.g., ABC Company Service" required />
                                <Input id="brn" label="Business Registration Number(BRN)" placeholder="e.g., Reg No. 123456" required />
                                <Input id="businessAddress" label="Business Address" placeholder="e.g., No;78, york street, colombo 5" required />
                                <Input id="businessContact" label="Business Contact Number" placeholder="e.g., 011 1234 567" required />
                            </div>
                        </>
                    )}

                    <div className="cc-form-actions">
                        <Button type="submit" variant="primary" size="lg" className="cc-btn-full">
                            Next
                        </Button>
                    </div>
                </form>

            </Card>
        </PageContainer>
    );
}