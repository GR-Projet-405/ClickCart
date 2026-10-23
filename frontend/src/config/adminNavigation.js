import {
  CalendarCheck,
  CircleDollarSign,
  FolderTree,
  Home,
  Percent,
  Settings,
  UserRoundCheck,
  Users,
} from "lucide-react";

export const adminNavigation = [
  { label: "Dashboard",           path: "/admin",                  icon: Home            },
  { label: "Users",               path: "/admin/users",            icon: Users           },
  { label: "Providers",           path: "/admin/providers",        icon: UserRoundCheck  },
  { label: "Bookings",            path: "/admin/bookings",         icon: CalendarCheck   },
  { label: "Transactions",        path: "/admin/transactions",     icon: CircleDollarSign},
  { label: "Commission Mgmt",     path: "/commission_management",  icon: Percent         },
  { label: "Service Categories",  path: "/admin/categories",       icon: FolderTree      },
  { label: "My Profile", path: "/admin/profile", icon: Settings },
];
