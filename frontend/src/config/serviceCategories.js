export const SERVICE_CATEGORIES = [
  "Home & Maintenance",
  "Electrical",
  "Plumbing",
  "IT & Electronics",
  "Cleaning",
  "Beauty & Wellness",
  "Automotive",
  "Other",
];

// Category groups shown as AI-suggested chips on the AI Search page
// (matches "Example Service Categories" in the project proposal / SRS Appendix A).
// `icon` is a lucide-react icon name resolved in AiServiceSearchPage.
export const AI_CATEGORY_GROUPS = [
  { id: "home-maintenance", label: "Home & Maintenance", icon: "Wrench" },
  { id: "technology", label: "Technology", icon: "Zap" },
  { id: "education", label: "Education", icon: "GraduationCap" },
  { id: "automotive", label: "Automotive", icon: "Car" },
  { id: "creative-events", label: "Creative & Events", icon: "Sparkles" },
  { id: "personal-services", label: "Personal Services", icon: "Droplet" },
];
