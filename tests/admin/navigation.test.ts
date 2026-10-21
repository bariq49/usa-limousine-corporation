import { describe, expect, it } from "vitest";
import { navigation } from "../../apps/admin/config/navigation";

describe("admin navigation", () => {
  it("only links to existing foundation routes", () => {
    const hrefs = navigation.flatMap((section) =>
      section.groups.flatMap((group) => group.items.map((item) => item.href)),
    );
    expect(hrefs.sort()).toEqual([
      "/analytics",
      "/cancelled-bookings",
      "/categories",
      "/completed-bookings",
      "/confirmed-bookings",
      "/extra-services",
      "/help-center",
      "/pending-bookings",
      "/pricing",
      "/profile-setting",
      "/standard-luggage",
    ]);
  });
});
