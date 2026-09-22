import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Home,
  Lock,
  Menu,
  Shield,
  X,
  Bell,
  Heart,
  Sparkles,
} from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import CustomerAccountSidebar from "../../components/customer/CustomerAccountSidebar";
import ProfileHeaderCard from "../../components/customer/ProfileHeaderCard";
import PersonalInfoSection from "../../components/customer/PersonalInfoSection";
import AccountSummarySection from "../../components/customer/AccountSummarySection";
import SavedAddressesSection from "../../components/customer/SavedAddressesSection";
import EditProfileModal from "../../components/customer/EditProfileModal";
import AddressModal from "../../components/customer/AddressModal";
import { initialCustomerProfile } from "../../config/profileData";
import "./CustomerProfilePage.css";

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialCustomerProfile);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = (updatedData) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
    }));
    showToast("Profile details updated successfully!");
  };

  const handleAvatarChange = (newAvatarUrl) => {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: newAvatarUrl,
    }));
    showToast("Profile photo updated successfully!");
  };

  const handleAddAddress = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr) => {
    setAddressToEdit(addr);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (addressData) => {
    setProfile((prev) => {
      let updatedAddresses = [...prev.savedAddresses];
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
        updatedAddresses.push(addressData);
      }

      return {
        ...prev,
        savedAddresses: updatedAddresses,
      };
    });

    showToast(
      addressToEdit
        ? "Address updated successfully!"
        : "New address added successfully!"
    );
  };

  const handleDeleteAddress = (id) => {
    setProfile((prev) => ({
      ...prev,
      savedAddresses: prev.savedAddresses.filter((a) => a.id !== id),
    }));
    showToast("Address removed.");
  };

  const handleSetDefaultAddress = (id) => {
    setProfile((prev) => ({
      ...prev,
      savedAddresses: prev.savedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    }));
    showToast("Default address updated!");
  };

  return (
    <div className="customer-profile-page">
      {toastMessage && (
        <div className="customer-profile-page__toast" role="status">
          <CheckCircle2 size={18} color="var(--cc-success)" />
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
                className={`customer-profile-page__mob-tab ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile & Details
              </button>
              <button
                type="button"
                className={`customer-profile-page__mob-tab ${
                  activeTab === "addresses" ? "active" : ""
                }`}
                onClick={() => setActiveTab("addresses")}
              >
                Saved Addresses ({profile.savedAddresses.length})
              </button>
              <button
                type="button"
                className={`customer-profile-page__mob-tab ${
                  activeTab === "activity" ? "active" : ""
                }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
              <button
                type="button"
                className={`customer-profile-page__mob-tab ${
                  activeTab === "security" ? "active" : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
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
                  addresses={profile.savedAddresses}
                  onAddAddress={handleAddAddress}
                  onEditAddress={handleEditAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                />

                <AccountSummarySection
                  stats={profile.stats}
                  activities={profile.recentActivities}
                  onExploreServices={() => navigate("/find-services")}
                />
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="customer-profile-page__tab-content">
                <SavedAddressesSection
                  addresses={profile.savedAddresses}
                  onAddAddress={handleAddAddress}
                  onEditAddress={handleEditAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                />
              </div>
            )}

            {activeTab === "activity" && (
              <div className="customer-profile-page__tab-content">
                <AccountSummarySection
                  stats={profile.stats}
                  activities={profile.recentActivities}
                  onExploreServices={() => navigate("/find-services")}
                />
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="customer-profile-page__tab-content">
                <Card className="customer-profile-page__placeholder-card">
                  <div className="customer-profile-page__placeholder-icon">
                    <Heart size={28} color="#e11d48" />
                  </div>
                  <h2 className="cc-h3">Saved & Favorite Service Providers</h2>
                  <p className="cc-text-secondary">
                    You currently have {profile.stats.favoriteProviders} saved favorite service providers in Colombo.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/find-services")}>
                    Browse Marketplace
                  </Button>
                </Card>
              </div>
            )}

            {activeTab === "security" && (
              <div className="customer-profile-page__tab-content">
                <Card className="customer-profile-page__placeholder-card">
                  <div className="customer-profile-page__placeholder-icon">
                    <Shield size={28} color="var(--cc-primary-dark)" />
                  </div>
                  <h2 className="cc-h3">Account Security & Verification</h2>
                  <p className="cc-text-secondary">
                    Your account is secured with 2-Factor Authentication and Level 2 National ID Verification.
                  </p>
                  <div className="customer-profile-page__sec-badges">
                    <Badge variant="success">Password Protected</Badge>
                    <Badge variant="success">2FA Enabled</Badge>
                    <Badge variant="success">National ID Verified</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </Card>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="customer-profile-page__tab-content">
                <Card className="customer-profile-page__placeholder-card">
                  <div className="customer-profile-page__placeholder-icon">
                    <Bell size={28} color="var(--cc-primary-dark)" />
                  </div>
                  <h2 className="cc-h3">Notification Preferences</h2>
                  <p className="cc-text-secondary">
                    Manage your email and SMS service booking alerts and appointment reminders.
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Alerts
                  </Button>
                </Card>
              </div>
            )}
          </main>
        </div>
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
