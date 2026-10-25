import { Heart, MapPin, UserRound } from "lucide-react";

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
    id: "favorites",
    label: "Favorites & Saved",
    icon: Heart,
    description: "Saved services & favorite providers",
  },
];
