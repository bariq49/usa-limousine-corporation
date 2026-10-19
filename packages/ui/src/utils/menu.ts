import type { MenuItem, MenuSection, RoleKey } from "../types/navigation";

export function isMenuVisible(
  item: { visibility?: { roles?: RoleKey[] } },
  roles?: RoleKey[],
): boolean {
  const allowed = item.visibility?.roles;
  if (!allowed || allowed.length === 0) {
    return true;
  }
  if (!roles || roles.length === 0) {
    return true;
  }
  return allowed.some((role) => roles.includes(role));
}

export function filterMenuSections(sections: MenuSection[], roles?: RoleKey[]): MenuSection[] {
  return sections
    .map((section) => {
      const { groups, ...rest } = section;
      return {
        ...rest,
        groups: groups
          .map((group) => ({
            id: group.id,
            items: filterItems(group.items, roles),
          }))
          .filter((group) => group.items.length > 0),
      };
    })
    .filter((section) => section.groups.length > 0);
}

function filterItems(items: MenuItem[], roles?: RoleKey[]): MenuItem[] {
  return items
    .filter((item) => isMenuVisible(item, roles))
    .map((item) => {
      if (!item.children) {
        return item;
      }
      return {
        ...item,
        children: filterItems(item.children, roles),
      };
    });
}
