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

export type ShellNavIcon = ComponentType<{ className?: string }>;

export type ShellNavChild = {
  title: string;
  href?: string;
  icon?: ShellNavIcon;
  nested?: ShellNavChild[];
  child?: ShellNavChild[];
};

export type ShellNavItem = {
  title: string;
  href?: string;
  icon?: ShellNavIcon;
  child?: ShellNavChild[];
};

export type ModuleMenuItemProps = {
  childItem: ShellNavChild;
  toggleNested: (subIndex: number) => void;
  nestedIndex: number | null;
  index: number;
  locationName: string;
  siblingHrefs: readonly (string | undefined)[];
};

export type NestedMenusProps = {
  nestedIndex: number | null;
  index: number;
  nestedMenus: ShellNavChild[] | undefined;
  locationName: string;
};

export type NavLinkProps = {
  childItem: ShellNavChild;
  locationName: string;
  siblingHrefs: readonly (string | undefined)[];
};

export type SingleIconMenuProps = {
  index: number;
  activeIndex: number | null;
  item: ShellNavItem;
  locationName: string;
};
