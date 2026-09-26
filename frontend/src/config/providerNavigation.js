import {
  CalendarCheck,
  CalendarDays,
  Home,
  Mail,
  Settings,
  Star,
  UserRound,
  WalletCards,
  Wrench,
  MapPin,
} from "lucide-react";

export const providerNavigation = [
  { label: "Dashboard", path: "/provider/dashboard", icon: Home },
  { label: "My Services", path: "/provider/services", icon: Wrench },
  { label: "Bookings", path: "/provider/bookings", icon: CalendarCheck },
  { label: "Messages", path: "/provider/messages", icon: Mail, demoCount: 3 },
  { label: "Calendar", path: "/provider/calendar", icon: CalendarDays },
  { label: "Service Areas", path: "/provider/service-areas", icon: MapPin },
  { label: "Earnings", path: "/provider/earnings", icon: WalletCards },
  { label: "Reviews", path: "/provider/reviews", icon: Star },
  { label: "Profile", path: "/provider/profile", icon: UserRound },
  { label: "Settings", path: "/provider/settings", icon: Settings },
];
