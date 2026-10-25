import React, { useState } from "react";
import { Calendar, Clock, DollarSign, MapPin, User, Phone, FileText } from "lucide-react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import { createCustomJob } from "../../services/providerJobService";

export default function CreateCustomJobModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    serviceTitle: "",
    serviceCategory: "",
    packageName: "",
    address: "",
    city: "",
    scheduledStart: "",
    scheduledEnd: "",
    serviceBaseFee: "",
    partsTopUp: "",
    accessInstructions: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const jobData = {
        ...formData,
        serviceBaseFee: formData.serviceBaseFee ? parseFloat(formData.serviceBaseFee) : null,
        partsTopUp: formData.partsTopUp ? parseFloat(formData.partsTopUp) : null,
        scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : null,
        scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd).toISOString() : null,
      };

      await createCustomJob(jobData);
      onSuccess?.();
      onClose();
      setFormData({
        customerName: "",
        customerPhone: "",
        serviceTitle: "",
        serviceCategory: "",
        packageName: "",
        address: "",
        city: "",
        scheduledStart: "",
        scheduledEnd: "",
        serviceBaseFee: "",
        partsTopUp: "",
        accessInstructions: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create custom job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Custom Job / Quote"
      size="lg"
      footer={
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Job
          </Button>
        </div>
      }
    >
      {error && (
        <div style={{ padding: "0.75rem", marginBottom: "1rem", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "0.375rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
            leftIcon={<User size={16} />}
          />
          <Input
            label="Customer Phone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="Enter phone number"
            leftIcon={<Phone size={16} />}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Service Title"
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            placeholder="e.g., AC Repair"
            required
            leftIcon={<FileText size={16} />}
          />
          <Input
            label="Service Category"
            name="serviceCategory"
            value={formData.serviceCategory}
            onChange={handleChange}
            placeholder="e.g., HVAC"
            required
          />
        </div>

        <Input
          label="Package Name (Optional)"
          name="packageName"
          value={formData.packageName}
          onChange={handleChange}
          placeholder="e.g., Standard Service"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address"
            required
            leftIcon={<MapPin size={16} />}
          />
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City name"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Scheduled Start"
            name="scheduledStart"
            type="datetime-local"
            value={formData.scheduledStart}
            onChange={handleChange}
            required
            leftIcon={<Calendar size={16} />}
          />
          <Input
            label="Scheduled End"
            name="scheduledEnd"
            type="datetime-local"
            value={formData.scheduledEnd}
            onChange={handleChange}
            required
            leftIcon={<Clock size={16} />}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Service Base Fee (LKR)"
            name="serviceBaseFee"
            type="number"
            step="0.01"
            value={formData.serviceBaseFee}
            onChange={handleChange}
            placeholder="0.00"
            required
            leftIcon={<DollarSign size={16} />}
          />
          <Input
            label="Parts Top-Up (LKR)"
            name="partsTopUp"
            type="number"
            step="0.01"
            value={formData.partsTopUp}
            onChange={handleChange}
            placeholder="0.00"
            leftIcon={<DollarSign size={16} />}
          />
        </div>

        <Textarea
          label="Access Instructions"
          name="accessInstructions"
          value={formData.accessInstructions}
          onChange={handleChange}
          placeholder="e.g., Gate code, parking instructions"
          rows={2}
        />

        <Textarea
          label="Additional Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional details about the job"
          rows={2}
        />
      </form>
    </Modal>
  );
}
