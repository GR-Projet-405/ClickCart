import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceAreaForm from "./components/ServiceAreaForm";
import Toast from "./components/Toast";
import { createServiceArea } from "../../../services/serviceAreaApi";

export default function AddServiceAreaPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleSubmit = async (payload, setErrors) => {
    try {
      setSubmitting(true);
      await createServiceArea(payload);
      setToast({
        message: `Service area for ${payload.cityName} created successfully!`,
        type: "success",
      });
      setTimeout(() => {
        navigate("/provider/service-areas");
      }, 1000);
    } catch (err) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setToast({
        message: err.message || "Failed to create service area",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ServiceAreaForm
        title="Add Service Area"
        subtitle="Set up a new service area to expand your coverage and reach more customers."
        onSubmit={handleSubmit}
        submitting={submitting}
        isEdit={false}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </>
  );
}
