import React, { useState } from "react";
import {
  Building2,
  Check,
  Home,
  MapPin,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Star,
} from "lucide-react";
import Card from "../../common/Card";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import IconButton from "../../common/IconButton";
import "./styles.css";

export default function SavedAddressesSection({
  addresses,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}) {
  const getIconForType = (type) => {
    switch (type) {
      case "Home":
        return Home;
      case "Office":
        return Building2;
      default:
        return MapPin;
    }
  };

  return (
    <Card className="saved-addresses-card">
      <div className="saved-addresses-card__header">
        <div>
          <h2 className="cc-h3 saved-addresses-card__title">Saved Addresses</h2>
          <p className="cc-caption cc-text-secondary">
            Manage your service and delivery addresses for quick booking.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={onAddAddress}
        >
          Add New Address
        </Button>
      </div>

      <div className="saved-addresses-card__grid">
        {addresses.map((addr) => {
          const Icon = getIconForType(addr.type);
          return (
            <div
              key={addr.id}
              className={`saved-addresses-card__item ${
                addr.isDefault ? "saved-addresses-card__item--default" : ""
              }`}
            >
              <div className="saved-addresses-card__item-top">
                <div className="saved-addresses-card__item-title-wrap">
                  <span className="saved-addresses-card__type-icon">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h3 className="cc-h4 saved-addresses-card__label">
                      {addr.label}
                    </h3>
                    <span className="saved-addresses-card__recipient">
                      {addr.recipientName} &bull; {addr.phone}
                    </span>
                  </div>
                </div>
                {addr.isDefault ? (
                  <Badge variant="success" className="saved-addresses-card__default-badge">
                    <Check size={12} style={{ marginRight: 3 }} />
                    Default
                  </Badge>
                ) : (
                  <button
                    type="button"
                    className="saved-addresses-card__set-default-btn"
                    onClick={() => onSetDefault(addr.id)}
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div className="saved-addresses-card__address-body">
                <p className="saved-addresses-card__line">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p className="saved-addresses-card__city">
                  {addr.city} {addr.postalCode ? `(${addr.postalCode})` : ""},{" "}
                  {addr.province}, {addr.country}
                </p>
                {addr.notes && (
                  <p className="saved-addresses-card__notes">
                    <small>Note: {addr.notes}</small>
                  </p>
                )}
              </div>

              <div className="saved-addresses-card__item-actions">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 size={13} />}
                  onClick={() => onEditAddress(addr)}
                >
                  Edit
                </Button>
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="saved-addresses-card__delete-btn"
                    leftIcon={<Trash2 size={13} />}
                    onClick={() => onDeleteAddress(addr.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
