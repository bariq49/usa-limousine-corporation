import type { MenuSection } from "@usa-limousine-corporation/ui/types/navigation";
import { Dashboard, Device, Graph, Support, User } from "@usa-limousine-corporation/ui/svg";
import { APP_CONFIG } from "./app";

export const APP_NAME = APP_CONFIG.name;

export const navigation: MenuSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Dashboard,
    submenu: true,
    groups: [
      {
        id: "main",
        items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Graph }],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Device,
    submenu: true,
    groups: [
      {
        id: "settings-group",
        items: [
          {
            id: "profile-setting",
            label: "Profile Settings",
            href: "/profile-setting",
            icon: User,
          },
          { id: "help-center", label: "Help Center", href: "/help-center", icon: Support },
        ],
      },
    ],
  },
];
