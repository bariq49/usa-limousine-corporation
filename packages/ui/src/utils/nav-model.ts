import type { ComponentType } from "react";
import type { MenuItem, MenuSection, NavIcon, RoleKey } from "../types/navigation";
import { filterMenuSections } from "./menu";

export type ShellNavIcon = ComponentType<{ className?: string }>;

export interface ShellNavChild {
  title: string;
  href?: string;
  icon?: ShellNavIcon;
  nested?: ShellNavChild[];
  child?: ShellNavChild[];
}

export interface ShellNavItem {
  title: string;
  href?: string;
  icon?: ShellNavIcon;
  child?: ShellNavChild[];
}

function resolveIcon(rawIcon?: NavIcon): ShellNavIcon | undefined {
  if (!rawIcon) return undefined;
  if (typeof rawIcon === "function" || (typeof rawIcon === "object" && rawIcon !== null)) {
    return rawIcon as ShellNavIcon;
  }
  return undefined;
}

export function toShellNav(sections: MenuSection[], roles?: RoleKey[]): ShellNavItem[] {
  return filterMenuSections(sections, roles).map((section) => {
    const items = section.groups.flatMap((group) => group.items);
    const first = items[0];
    const Icon = resolveIcon(section.icon) ?? resolveIcon(first?.icon);
    if (!section.submenu && items.length === 1 && first && !first.children) {
      const item: ShellNavItem = {
        title: section.label ?? first.label,
      };
      if (Icon) item.icon = Icon;
      if (first.href) item.href = first.href;
      return item;
    }
    const navItem: ShellNavItem = {
      title: section.label ?? first?.label ?? section.id,
      child: items.map(toChild),
    };
    if (Icon) navItem.icon = Icon;
    return navItem;
  });
}

function toChild(item: MenuItem): ShellNavChild {
  const Icon = resolveIcon(item.icon);
  const child: ShellNavChild = {
    title: item.label,
  };

  if (item.href) child.href = item.href;
  if (Icon) child.icon = Icon;
  if (item.children) child.nested = item.children.map(toChild);

  return child;
}
