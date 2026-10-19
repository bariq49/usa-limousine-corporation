import { describe, expect, it } from "vitest";
import { filterMenuSections, isMenuVisible } from "../../../packages/ui/src/utils/menu";
import { RoleKey, type MenuSection } from "../../../packages/ui/src/types/navigation";

const sections: MenuSection[] = [
  {
    id: "overview",
    label: "Overview",
    groups: [
      {
        id: "main",
        items: [
          { id: "dashboard", label: "Dashboard", href: "/dashboard" },
          {
            id: "secret",
            label: "Secret",
            href: "/secret",
            visibility: { roles: [RoleKey.SUPER_ADMIN] },
          },
        ],
      },
    ],
  },
];

describe("menu visibility", () => {
  it("shows unrestricted items", () => {
    expect(isMenuVisible({}, undefined)).toBe(true);
  });

  it("keeps restricted items visible when no roles are supplied", () => {
    const filtered = filterMenuSections(sections);
    const labels = filtered[0]?.groups[0]?.items.map((item) => item.id);
    expect(labels).toEqual(["dashboard", "secret"]);
  });

  it("hides restricted items when roles are supplied and do not match", () => {
    const filtered = filterMenuSections(sections, [RoleKey.CUSTOMER]);
    const labels = filtered[0]?.groups[0]?.items.map((item) => item.id);
    expect(labels).toEqual(["dashboard"]);
  });
});
