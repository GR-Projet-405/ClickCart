const STORAGE_KEY = "clickcart_provider_profile";

export const EMPTY_PROFILE = {
  providerType: "individual",
  fullName: "",
  businessName: "",
  contactPerson: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  imagePreview: null,
};

export function getProviderProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return EMPTY_PROFILE;
    }
    const parsed = JSON.parse(data);
    return {
      ...EMPTY_PROFILE,
      ...parsed,
    };
  } catch (e) {
    console.error("Error reading provider profile from localStorage", e);
    return EMPTY_PROFILE;
  }
}

export function saveProviderProfile(profileData) {
  try {
    const current = getProviderProfile();
    const updated = { ...current, ...profileData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("provider_profile_updated"));
    return updated;
  } catch (e) {
    console.error("Error saving provider profile to localStorage", e);
    return profileData;
  }
}

export function calculateProfileStatus(profile) {
  if (!profile) return "NOT_STARTED";

  const isIndividual = profile.providerType !== "business";
  const hasName = isIndividual
    ? !!profile.fullName?.trim()
    : !!profile.businessName?.trim() && !!profile.contactPerson?.trim();

  const hasEmail = !!profile.email?.trim();
  const hasPhone = !!profile.phone?.trim();
  const hasLocation = !!profile.location?.trim();

  const filledCount = [hasName, hasEmail, hasPhone, hasLocation].filter(Boolean).length;

  if (filledCount === 0) {
    return "NOT_STARTED";
  } else if (hasName && hasEmail && hasPhone && hasLocation) {
    return "COMPLETED";
  } else {
    return "PARTIALLY_COMPLETED";
  }
}

export function getCompletionPercentage(profile) {
  if (!profile) return 0;

  const isIndividual = profile.providerType !== "business";
  const hasName = isIndividual
    ? !!profile.fullName?.trim()
    : !!profile.businessName?.trim() && !!profile.contactPerson?.trim();

  const hasEmail = !!profile.email?.trim();
  const hasPhone = !!profile.phone?.trim();
  const hasLocation = !!profile.location?.trim();

  // Weighted scoring for required fields (total = 100%)
  let score = 0;
  if (hasName) score += 30;
  if (hasEmail) score += 25;
  if (hasPhone) score += 25;
  if (hasLocation) score += 20;

  if (hasName && hasEmail && hasPhone && hasLocation) {
    return 100;
  }

  return score;
}
