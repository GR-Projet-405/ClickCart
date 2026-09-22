import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText } from "lucide-react";

import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";

import "./Verification.css";

// Reusable Upload Zone Component
const FileUploadZone = ({ label, fileName, onFileSelect }) => {
    return (
        <div className="cc-upload-group">
            <label className="cc-upload-label">{label}</label>
            <div className="cc-upload-dropzone">
                <input
                    type="file"
                    className="cc-upload-input"
                    onChange={(e) => onFileSelect(e.target.files[0])}
                    accept="image/*,.pdf"
                />
                <div className="cc-upload-content">
                    <UploadCloud size={32} className="cc-upload-icon" />
                    <p>Drag and Drop files here or click to browse</p>
                </div>
            </div>
            {/* Show selected file name with green icon just like in the image */}
            {fileName && (
                <div className="cc-file-name">
                    <FileText size={16} /> {fileName}
                </div>
            )}
        </div>
    );
};

export default function VerificationStep2() {
    const navigate = useNavigate();
    // State to manage toggle between individual and business layouts
    const [providerType, setProviderType] = useState("business");

    // States to hold the selected files
    const [nicFront, setNicFront] = useState(null);
    const [nicBack, setNicBack] = useState(null);
    const [businessCert, setBusinessCert] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real scenario, you would upload files to Cloudinary/S3 here, 
        // get the URLs, and send those URLs to your backend database.
        console.log("Mock Uploading files...");
        navigate("/provider/verification/success"); // Navigate to success or dashboard
    };

    const handleBack = () => {
        navigate("/provider/verification/step-1");
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

                {/* Progress Stepper - Step 2 Active */}
                <div className="cc-stepper">
                    <div className="cc-step complete">
                        <div className="cc-step-circle">✓</div>
                    </div>
                    <div className="cc-step-line complete"></div>
                    <div className="cc-step active">
                        <div className="cc-step-circle">2</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="cc-verification-form">
                    <h3 className="cc-form-section-title">Documents Upload</h3>

                    {providerType === "business" ? (
                        // Business Layout: NIC grid (side-by-side) + Business Cert full width
                        <div className="cc-documents-section">
                            <div className="cc-upload-grid-2">
                                <FileUploadZone
                                    label="National ID Card( Front)"
                                    fileName={nicFront?.name || "My NIC Front.pdf"}
                                    onFileSelect={setNicFront}
                                />
                                <FileUploadZone
                                    label="National ID Card( Back)"
                                    fileName={nicBack?.name || "My NIC Back.pdf"}
                                    onFileSelect={setNicBack}
                                />
                            </div>
                            <div className="cc-upload-full mt-4">
                                <FileUploadZone
                                    label="Business Registration/ Certificates"
                                    fileName={businessCert?.name || "20251025db53522ytt25r1d2d2.jpg"}
                                    onFileSelect={setBusinessCert}
                                />
                            </div>
                        </div>
                    ) : (
                        // Individual Layout: Stacked full width
                        <div className="cc-documents-section cc-stacked">
                            <FileUploadZone
                                label="National ID Card( Front)"
                                fileName={nicFront?.name || "My NIC Front.pdf"}
                                onFileSelect={setNicFront}
                            />
                            <FileUploadZone
                                label="National ID Card( Back)"
                                fileName={nicBack?.name || "My NIC Back.pdf"}
                                onFileSelect={setNicBack}
                            />
                        </div>
                    )}

                    <div className="cc-form-actions-row">
                        <Button type="button" variant="outline" size="lg" onClick={handleBack}>
                            Back
                        </Button>
                        <Button type="submit" variant="primary" size="lg">
                            Submit for Verification
                        </Button>
                    </div>
                </form>

            </Card>
        </PageContainer>
    );
}