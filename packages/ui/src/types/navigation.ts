import type { ComponentType } from "react";

export const RoleKey = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;

export type RoleKey = (typeof RoleKey)[keyof typeof RoleKey];

export type NavIcon = string | ComponentType<{ className?: string }>;

export type MenuItem = {
  id: string;
  label: string;
  href?: string;
  icon?: NavIcon;
  children?: MenuItem[];
  visibility?: { roles?: RoleKey[] };
};

export type MenuGroup = {
  id: string;
  items: MenuItem[];
};

export type MenuSection = {
  id: string;
  label?: string;
  icon?: NavIcon;
  submenu?: boolean;
  groups: MenuGroup[];
};
