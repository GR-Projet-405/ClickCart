import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ServiceAreaForm from "./components/ServiceAreaForm";
import Toast from "./components/Toast";
import Spinner from "../../../components/common/Spinner";
import { fetchServiceAreaById, updateServiceArea } from "../../../services/serviceAreaApi";

export default function EditServiceAreaPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchServiceAreaById(id);
        if (mounted) {
          setInitialData(data);
        }
      } catch (err) {
        if (mounted) {
          setToast({
            message: err.message || "Failed to load service area details",
            type: "error",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (payload, setErrors) => {
    try {
      setSubmitting(true);
      await updateServiceArea(id, payload);
      setToast({
        message: `Service area for ${payload.cityName} updated successfully!`,
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
        message: err.message || "Failed to update service area",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "20rem" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <ServiceAreaForm
        title="Edit Service Area"
        subtitle="Update your service coverage details and radius parameters."
        initialData={initialData}
        onSubmit={handleSubmit}
        submitting={submitting}
        isEdit={true}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </>
  );
}
