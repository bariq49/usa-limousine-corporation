import { describe, expect, it } from "vitest";
import { toShellNav } from "../../../packages/ui/src/utils/nav-model";
import type { MenuSection } from "../../../packages/ui/src/types/navigation";

const DummyIcon = () => null;

const navigation: MenuSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: DummyIcon,
    groups: [
      {
        id: "main",
        items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard", icon: DummyIcon }],
      },
    ],
  },
  {
    id: "account",
    label: "Profile",
    icon: DummyIcon,
    groups: [
      {
        id: "me",
        items: [{ id: "profile", label: "Profile", href: "/profile", icon: DummyIcon }],
      },
    ],
  },
];

describe("toShellNav", () => {
  it("maps sections to shell items with hrefs", () => {
    const nav = toShellNav(navigation);
    expect(nav.map((item) => item.href)).toEqual(["/dashboard", "/profile"]);
    expect(nav[0]?.icon).toBe(DummyIcon);
    expect(nav[1]?.icon).toBe(DummyIcon);
  });

  it("maps dispatch items without errors", () => {
    const withDispatch: MenuSection[] = [
      {
        id: "ops",
        label: "Ops",
        icon: DummyIcon,
        groups: [
          {
            id: "main",
            items: [{ id: "dispatch", label: "Dispatch", href: "/dispatch", icon: DummyIcon }],
          },
        ],
      },
    ];
    const nav = toShellNav(withDispatch);
    expect(nav[0]?.href).toBe("/dispatch");
    expect(nav[0]?.icon).toBe(DummyIcon);
  });
});
