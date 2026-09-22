import {
  Bell,
  Clock,
  Heart,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

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
    badge: "2",
  },
  {
    id: "activity",
    label: "Activity & Bookings",
    icon: Clock,
    description: "Recent requests & order history",
    badge: "3",
  },
  {
    id: "favorites",
    label: "Saved Providers",
    icon: Heart,
    description: "Favorite specialists & stores",
  },
  {
    id: "security",
    label: "Security & Login",
    icon: ShieldCheck,
    description: "Password & 2FA protection",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email & SMS alert preferences",
  },
];
