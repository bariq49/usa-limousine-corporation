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
      "/delete-requests",
      "/drivers",
      "/extra-services",
      "/help-center",
      "/pending-bookings",
      "/platform-settings",
      "/pricing",
      "/profile-setting",
      "/special-luggage",
      "/standard-luggage",
      "/vehicles",
    ]);
  });
});
