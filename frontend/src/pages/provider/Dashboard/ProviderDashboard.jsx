import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Avatar from "../../../components/common/Avatar";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";

import "./ProviderDashboard.css";

export default function ProviderDashboard() {
    const navigate = useNavigate();

    // Mock state to handle verification flow since backend is not ready
    // Possible states: 'unverified', 'pending', 'verified'
    const [verificationStatus, setVerificationStatus] = useState("unverified");

    const handleStartVerification = () => {
        // Navigate to the first step of the verification form
        navigate("/provider/verification/step-1");
    };

    return (
        <PageContainer className="cc-provider-dashboard">

            {/* Top Welcome Banner */}
            <Card variant="flat" padding="md" className="cc-dashboard-banner">
                <div className="cc-dashboard-banner__content">

                    <div className="cc-dashboard-banner__profile">
                        <Avatar
                            src="/assets/images/kamal-perera.jpg"
                            alt="Kamal Perera"
                            size="xl"
                            online={true}
                        />
                        <div className="cc-dashboard-banner__info">
                            <span className="cc-text-muted cc-text-sm">Welcome back,</span>
                            <h2 className="cc-h2">Kamal Perera</h2>
                            <div className="cc-dashboard-banner__meta">
                                <span className="cc-text-muted cc-text-sm">AC Repair & Installation • Colombo, Sri Lanka</span>
                                <Badge variant={verificationStatus === "unverified" ? "warning" : "success"}>
                                    {verificationStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="cc-dashboard-banner__promo">
                        <div className="cc-promo-text">
                            <h4>Help more customers<br />with your skills</h4>
                            <p className="cc-text-muted cc-text-sm">Keep your services updated<br />and grow your business.</p>
                        </div>
                        <div className="cc-promo-action">
                            <TrendingUp className="cc-promo-icon" />
                            <Button size="sm" rightIcon={<ArrowRight size={16} />}>
                                Add a New Service
                            </Button>
                        </div>
                    </div>

                </div>
            </Card>

            {/* Verification Required Alert - Rendered conditionally */}
            {verificationStatus === "unverified" && (
                <Card
                    variant="bordered"
                    padding="lg"
                    className="cc-verification-alert"
                >
                    <div className="cc-verification-alert__message">
                        <AlertTriangle className="cc-alert-icon" />
                        <h3>
                            <strong>Action Required:</strong> you must verify your identity and business to start accepting jobs on ClickCart
                        </h3>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleStartVerification}
                    >
                        Start Verification process
                    </Button>
                </Card>
            )}

        </PageContainer>
    );
}