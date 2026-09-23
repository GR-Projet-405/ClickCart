import { MapPin, ShieldCheck, UserRound } from "lucide-react";

export const customerAccountNavigation = [
  {
    id: "profile",
    label: "Personal Profile",
    icon: UserRound,
    description: "Account details & verification",
  },
  {
    id: "addresses",
    label: "Saved Addresses",
    icon: MapPin,
    description: "Manage delivery & service locations",
  },
  {
    id: "security",
    label: "Security & Login",
    icon: ShieldCheck,
    description: "Password & 2FA protection",
  },
];
