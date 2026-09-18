import {
  BarChart3,
  CalendarCheck,
  CircleDollarSign,
  Flag,
  FolderTree,
  Home,
  Megaphone,
  Settings,
  ShieldAlert,
  UserRoundCheck,
  Users,
} from "lucide-react";

export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Home },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Providers", path: "/admin/providers", icon: UserRoundCheck },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
  {
    label: "Transactions",
    path: "/admin/transactions",
    icon: CircleDollarSign,
  },
  { label: "Disputes & Support", path: "/admin/disputes", icon: ShieldAlert },
  { label: "Content Moderation", path: "/admin/moderation", icon: Flag },
  { label: "Service Categories", path: "/admin/categories", icon: FolderTree },
  { label: "Marketing", path: "/admin/marketing", icon: Megaphone },
  { label: "Reports & Analytics", path: "/admin/reports", icon: BarChart3 },
  { label: "System Settings", path: "/admin/settings", icon: Settings },
];
