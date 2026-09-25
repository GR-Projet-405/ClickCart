import {
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Home,
  Mail,
  Settings,
  Star,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

export const providerNavigation = [
  { label: "Dashboard", path: "/provider/dashboard", icon: Home },
  { label: "My Jobs", path: "/provider/jobs", icon: Briefcase },
  { label: "My Services", path: "/provider/services", icon: Wrench },
  { label: "Bookings", path: "/provider/bookings", icon: CalendarCheck },
  { label: "Messages", path: "/provider/messages", icon: Mail, demoCount: 3 },
  { label: "Calendar", path: "/provider/calendar", icon: CalendarDays },
  { label: "Earnings", path: "/provider/earnings", icon: WalletCards },
  { label: "Reviews", path: "/provider/reviews", icon: Star },
  { label: "Profile", path: "/provider/profile", icon: UserRound },
  { label: "Settings", path: "/provider/settings", icon: Settings },
];
