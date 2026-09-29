const API_BASE_URL = "http://localhost:8080/api/provider/profile";

export const EMPTY_PROFILE = {
  id: null,
  providerType: "individual",
  fullName: "",
  businessName: "",
  contactPerson: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  profileImage: "",
  profileStatus: "NOT_STARTED",
  completionPercentage: 0,
};

export async function getProviderProfile() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch provider profile: ${response.status}`);
    }
    const data = await response.json();
    return normalizeProfileResponse(data);
  } catch (error) {
    console.error("Error fetching provider profile from backend:", error);
    return EMPTY_PROFILE;
  }
}

export async function saveProviderProfile(profileData, id) {
  try {
    const profileId = id || profileData.id;
    const url = profileId ? `${API_BASE_URL}?id=${encodeURIComponent(profileId)}` : API_BASE_URL;

    // Map fields for ProviderProfileRequest DTO
    const requestBody = {
      providerType: profileData.providerType || "individual",
      fullName: profileData.fullName || "",
      businessName: profileData.businessName || "",
      contactPerson: profileData.contactPerson || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      location: profileData.location || "",
      bio: profileData.bio || "",
      profileImage: profileData.profileImage || profileData.imagePreview || "",
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to save provider profile: ${response.status}`);
    }

    const data = await response.json();
    const normalized = normalizeProfileResponse(data);
    window.dispatchEvent(new Event("provider_profile_updated"));
    return normalized;
  } catch (error) {
    console.error("Error saving provider profile to backend:", error);
    throw error;
  }
}

export async function getPublicProviderProfile(id) {
  try {
    if (!id) return getProviderProfile();
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch public provider profile: ${response.status}`);
    }
    const data = await response.json();
    return normalizeProfileResponse(data);
  } catch (error) {
    console.error("Error fetching public provider profile:", error);
    return EMPTY_PROFILE;
  }
}

function normalizeProfileResponse(data) {
  if (!data) return EMPTY_PROFILE;
  return {
    ...EMPTY_PROFILE,
    ...data,
    imagePreview: data.profileImage || data.imagePreview || null,
    profileStatus: data.profileStatus || calculateProfileStatus(data),
    completionPercentage: data.completionPercentage ?? getCompletionPercentage(data),
  };
}

export function calculateProfileStatus(profile) {
  if (!profile) return "NOT_STARTED";
  if (profile.profileStatus) return profile.profileStatus;

  const isIndividual = profile.providerType !== "business";
  const hasName = isIndividual
    ? !!profile.fullName?.trim()
    : !!profile.businessName?.trim() && !!profile.contactPerson?.trim();

  const hasEmail = !!profile.email?.trim();
  const hasPhone = !!profile.phone?.trim();
  const hasLocation = !!profile.location?.trim();

  const filledCount = [hasName, hasEmail, hasPhone, hasLocation].filter(Boolean).length;

  if (filledCount === 0) return "NOT_STARTED";
  if (hasName && hasEmail && hasPhone && hasLocation) return "COMPLETED";
  return "PARTIALLY_COMPLETED";
}

export function getCompletionPercentage(profile) {
  if (!profile) return 0;
  if (profile.completionPercentage !== undefined && profile.completionPercentage !== null) {
    return profile.completionPercentage;
  }

  const isIndividual = profile.providerType !== "business";
  const hasName = isIndividual
    ? !!profile.fullName?.trim()
    : !!profile.businessName?.trim() && !!profile.contactPerson?.trim();

  const hasEmail = !!profile.email?.trim();
  const hasPhone = !!profile.phone?.trim();
  const hasLocation = !!profile.location?.trim();

  let score = 0;
  if (hasName) score += 30;
  if (hasEmail) score += 25;
  if (hasPhone) score += 25;
  if (hasLocation) score += 20;

  return score;
}
