import React, { useState, useEffect } from "react";
import { Check, MapPin, X } from "lucide-react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Textarea from "../../common/Textarea";
import "./styles.css";

export default function AddressModal({
  isOpen,
  onClose,
  addressToEdit,
  onSave,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    label: "",
    type: "Home",
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    province: "Western Province",
    country: "Sri Lanka",
    notes: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (addressToEdit) {
      setFormData({ ...addressToEdit });
    } else {
      setFormData({
        label: "",
        type: "Home",
        recipientName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        postalCode: "",
        province: "Western Province",
        country: "Sri Lanka",
        notes: "",
        isDefault: false,
      });
    }
  }, [addressToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.label.trim()) newErrors.label = "Address label is required";
    if (!formData.recipientName.trim())
      newErrors.recipientName = "Recipient name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      id: addressToEdit?.id || `addr-${Date.now()}`,
    });
    onClose();
  };

  return (
    <div className="cc-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cc-modal address-modal">
        <div className="cc-modal__header">
          <div>
            <h2 className="cc-h3 cc-modal__title">
              {addressToEdit ? "Edit Saved Address" : "Add New Saved Address"}
            </h2>
            <p className="cc-caption cc-text-secondary">
              Configure your service location and recipient contact info.
            </p>
          </div>
          <button
            type="button"
            className="cc-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="address-modal__form">
          <div className="address-modal__grid">
            <Input
              label="Address Label (e.g. Home, Office, Parents) *"
              name="label"
              value={formData.label}
              onChange={handleChange}
              error={errors.label}
              placeholder="e.g. Home (Colombo 07)"
            />

            <Select
              label="Address Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Home">Home</option>
              <option value="Office">Office / Workspace</option>
              <option value="Other">Other / Villa</option>
            </Select>

            <Input
              label="Recipient Name *"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              error={errors.recipientName}
              placeholder="e.g. Kasun Perera"
            />

            <Input
              label="Contact Phone *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g. +94 77 123 4567"
            />

            <Input
              label="Street Address / Line 1 *"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              error={errors.addressLine1}
              placeholder="e.g. No. 45/2, Guildford Crescent"
            />

            <Input
              label="Apartment, Suite, Unit (Line 2)"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="e.g. Apt 4B"
            />

            <Input
              label="City / Town *"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="e.g. Colombo 07"
            />

            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g. 00700"
            />

            <Select
              label="Province"
              name="province"
              value={formData.province}
              onChange={handleChange}
            >
              <option value="Western Province">Western Province</option>
              <option value="Central Province">Central Province</option>
              <option value="Southern Province">Southern Province</option>
              <option value="North Western Province">North Western Province</option>
              <option value="Eastern Province">Eastern Province</option>
              <option value="Northern Province">Northern Province</option>
            </Select>

            <Input
              label="Country"
              name="country"
              value={formData.country}
              disabled
              readOnly
            />
          </div>

          <Textarea
            label="Service & Delivery Instructions"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Gate code, landmark, parking directions or special instructions for service providers..."
            rows={2}
          />

          <label className="address-modal__checkbox-label">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <span>Set as my default service & delivery address</span>
          </label>

          <div className="cc-modal__footer">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              leftIcon={<Check size={16} />}
            >
              {addressToEdit ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
