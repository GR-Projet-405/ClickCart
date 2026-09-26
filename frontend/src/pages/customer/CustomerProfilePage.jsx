import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Home,
  Loader2,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import CustomerAccountSidebar from "../../components/customer/CustomerAccountSidebar";
import ProfileHeaderCard from "../../components/customer/ProfileHeaderCard";
import PersonalInfoSection from "../../components/customer/PersonalInfoSection";
import SavedAddressesSection from "../../components/customer/SavedAddressesSection";
import EditProfileModal from "../../components/customer/EditProfileModal";
import AddressModal from "../../components/customer/AddressModal";
import { useCustomer } from "../../context/CustomerContext";
import "./CustomerProfilePage.css";

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const {
    profile,
    setProfile,
    isLoading,
    error,
    refreshProfile,
    saveProfile,
  } = useCustomer();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const saved = await saveProfile(updatedData);
      showToast("Profile details updated successfully!");
      return saved;
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast(err.message || "Failed to update profile on server.", "warning");
      throw err;
    }
  };

  const handleAvatarChange = async (newAvatarUrl) => {
    try {
      await saveProfile({ avatarUrl: newAvatarUrl });
      showToast("Profile photo updated successfully!");
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: newAvatarUrl,
      }));
      showToast("Profile photo updated locally.", "warning");
    }
  };

  const handleAddAddress = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr) => {
    setAddressToEdit(addr);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    let updatedAddresses = [...(profile.savedAddresses || [])];
    if (addressData.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({
        ...a,
        isDefault: false,
      }));
    }

    const existingIndex = updatedAddresses.findIndex(
      (a) => a.id === addressData.id
    );

    if (existingIndex >= 0) {
      updatedAddresses[existingIndex] = addressData;
    } else {
      updatedAddresses.push({
        ...addressData,
        id: addressData.id || `addr-${Date.now()}`,
      });
    }

    try {
      await saveProfile({ savedAddresses: updatedAddresses });
      showToast(
        addressToEdit
          ? "Address updated successfully!"
          : "New address added successfully!"
      );
    } catch (err) {
      console.error("Failed to save address:", err);
      setProfile((prev) => ({
        ...prev,
        savedAddresses: updatedAddresses,
      }));
      showToast("Address saved locally.", "warning");
    }
  };

  const handleDeleteAddress = async (id) => {
    const updatedAddresses = (profile.savedAddresses || []).filter(
      (a) => a.id !== id
    );

    try {
      await saveProfile({ savedAddresses: updatedAddresses });
      showToast("Address removed.");
    } catch (err) {
      console.error("Failed to delete address:", err);
      setProfile((prev) => ({
        ...prev,
        savedAddresses: updatedAddresses,
      }));
      showToast("Address removed locally.", "warning");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const updatedAddresses = (profile.savedAddresses || []).map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    try {
      await saveProfile({ savedAddresses: updatedAddresses });
      showToast("Default address updated!");
    } catch (err) {
      console.error("Failed to update default address:", err);
      setProfile((prev) => ({
        ...prev,
        savedAddresses: updatedAddresses,
      }));
      showToast("Default address updated locally.", "warning");
    }
  };

  return (
    <div className="customer-profile-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`customer-profile-page__toast ${toastType === "warning" ? "customer-profile-page__toast--warning" : ""
            }`}
          role="status"
        >
          {toastType === "warning" ? (
            <AlertCircle size={18} color="var(--cc-warning)" />
          ) : (
            <CheckCircle2 size={18} color="var(--cc-success)" />
          )}
          <span>{toastMessage}</span>
          <button
            type="button"
            className="customer-profile-page__toast-close"
            onClick={() => setToastMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <PageContainer className="customer-profile-page__container">
        {/* Breadcrumbs */}
        <nav
          className="customer-profile-page__breadcrumbs"
          aria-label="Breadcrumbs"
        >
          <Link to="/" className="customer-profile-page__crumb-link">
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={14} className="customer-profile-page__crumb-sep" />
          <span className="customer-profile-page__crumb-current">
            Customer Profile
          </span>
        </nav>

        {/* Server Connection Error Banner (non-blocking) */}
        {error && (
          <div className="customer-profile-page__error-banner" role="alert">
            <AlertCircle size={18} />
            <div className="customer-profile-page__error-content">
              <strong>Database Connection Notice:</strong> {error}
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={refreshProfile}
            >
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="customer-profile-page__loading-state">
            <Loader2 size={36} className="customer-profile-page__spinner" />
            <p className="cc-text-secondary">Loading customer profile from database...</p>
          </div>
        ) : profile ? (
          <div className="customer-profile-page__layout">
            {/* Sidebar */}
            <aside className="customer-profile-page__sidebar-col">
              <CustomerAccountSidebar
                profile={profile}
                activeTab={activeTab}
                onSelectTab={(tabId) => setActiveTab(tabId)}
              />
            </aside>

            {/* Main Content Area */}
            <main className="customer-profile-page__main-col">
              <ProfileHeaderCard
                profile={profile}
                onEditProfile={() => setIsEditModalOpen(true)}
                onAvatarChange={handleAvatarChange}
                onManageAddresses={() => setActiveTab("addresses")}
              />

              {/* Mobile Tab Navigation Bar */}
              <div className="customer-profile-page__mobile-tabs">
                <button
                  type="button"
                  className={`customer-profile-page__mob-tab ${activeTab === "profile" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile & Details
                </button>
                <button
                  type="button"
                  className={`customer-profile-page__mob-tab ${activeTab === "addresses" ? "active" : ""
                    }`}
                  onClick={() => setActiveTab("addresses")}
                >
                  Saved Addresses ({profile.savedAddresses?.length || 0})
                </button>
              </div>

              {/* Tab Views */}
              {activeTab === "profile" && (
                <div className="customer-profile-page__tab-content">
                  <PersonalInfoSection
                    profile={profile}
                    onEdit={() => setIsEditModalOpen(true)}
                  />

                  <SavedAddressesSection
                    addresses={profile.savedAddresses || []}
                    onAddAddress={handleAddAddress}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="customer-profile-page__tab-content">
                  <SavedAddressesSection
                    addresses={profile.savedAddresses || []}
                    onAddAddress={handleAddAddress}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                </div>
              )}
            </main>
          </div>
        ) : (
          <div className="customer-profile-page__error-banner" role="alert">
            <AlertCircle size={18} />
            <div className="customer-profile-page__error-content">
              <strong>Unable to load customer profile:</strong> {error || "Profile data not found in database."}
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={refreshProfile}
            >
              Retry
            </Button>
          </div>
        )}
      </PageContainer>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressToEdit={addressToEdit}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
