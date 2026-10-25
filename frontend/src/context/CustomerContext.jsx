import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
  const requestVersion = useRef(0);

  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated" || user?.role !== "CUSTOMER") return;
    const version = ++requestVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomerProfile();
      if (version === requestVersion.current) setProfile(data);
    } catch (err) {
      console.warn("CustomerContext: Failed to fetch profile from API:", err);
      if (version === requestVersion.current) setError(err.message || "Failed to load customer profile from database.");
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [status, user?.id, user?.role]);

  // Re-fetch profile whenever the authenticated user or session status changes
  useEffect(() => {
    setProfile(null);
    setError(null);
    if (status === "authenticated" && user?.role === "CUSTOMER") {
      fetchProfile();
    } else if (status !== "loading") {
      setProfile(null);
      setIsLoading(false);
    }
    return () => { requestVersion.current += 1; };
  }, [fetchProfile, status, user?.role]);

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

