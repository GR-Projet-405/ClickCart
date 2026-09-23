import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initialCustomerProfile } from "../config/profileData";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../services/customerProfileService";

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [profile, setProfile] = useState(initialCustomerProfile);
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
      setError(err.message || "Failed to load customer profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(async (updatedFields) => {
    const payload = {
      ...profile,
      ...updatedFields,
    };
    const saved = await updateCustomerProfile(payload);
    setProfile(saved);
    return saved;
  }, [profile]);

  const displayName = profile.preferredName?.trim() || profile.fullName?.trim()?.split(" ")[0] || "Customer";
  const avatarFallback = (profile.fullName?.trim() || "CP").slice(0, 2).toUpperCase();

  const value = {
    profile,
    setProfile,
    displayName,
    avatarFallback,
    isLoading,
    error,
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
