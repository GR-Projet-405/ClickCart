import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../services/customerProfileService";

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const { user, status, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomerProfile();
      setProfile(data);
    } catch (err) {
      console.warn("CustomerContext: Failed to fetch profile from API:", err);
      setError(err.message || "Failed to load customer profile from database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch profile whenever the authenticated user or session status changes
  useEffect(() => {
    if (status !== "loading") {
      fetchProfile();
    }
  }, [user?.id, status, fetchProfile]);

  const saveProfile = useCallback(async (updatedFields) => {
    const payload = {
      ...profile,
      ...updatedFields,
    };
    const saved = await updateCustomerProfile(payload);
    setProfile(saved);
    return saved;
  }, [profile]);

  const displayName = profile?.preferredName?.trim() || profile?.fullName?.trim()?.split(" ")[0] || user?.fullName?.split(" ")[0] || "Customer";
  const avatarFallback = (profile?.fullName?.trim() || user?.fullName?.trim() || "CP").slice(0, 2).toUpperCase();

  const value = {
    profile,
    setProfile,
    displayName,
    avatarFallback,
    isLoading,
    error,
    authUser: user,
    authStatus: status,
    logout,
    refreshProfile: fetchProfile,
    saveProfile,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}

