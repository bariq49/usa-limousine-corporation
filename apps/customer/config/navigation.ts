import type { MenuSection } from "@usa-limousine-corporation/ui/types/navigation";
import { APP_CONFIG } from "./app";

export const APP_NAME = APP_CONFIG.name;

export const navigation: MenuSection[] = [
  {
    id: "overview",
    label: "Overview",
    groups: [
      {
        id: "main",
        items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "dashboard" }],
      },
    ],
  },
  {
    id: "account",
    label: "Profile",
    groups: [
      {
        id: "me",
        items: [{ id: "profile", label: "Profile", href: "/profile", icon: "profile" }],
      },
    ],
  },
];
