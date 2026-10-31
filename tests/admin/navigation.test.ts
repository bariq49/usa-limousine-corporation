import { describe, expect, it } from "vitest";
import { navigation } from "../../apps/admin/config/navigation";

describe("admin navigation", () => {
  it("only links to existing foundation routes", () => {
    const hrefs = navigation.flatMap((section) =>
      section.groups.flatMap((group) => group.items.map((item) => item.href)),
    );
    expect(hrefs.sort()).toEqual([
      "/analytics",
      "/blog-categories",
      "/blog-comments",
      "/blog-tags",
      "/blogs",
      "/blogs/create",
      "/blogs/drafts",
      "/blogs/scheduled",
      "/bookings",
      "/cancelled-bookings",
      "/categories",
      "/completed-bookings",
      "/confirmed-bookings",
      "/customers",
      "/drivers",
      "/extra-services",
      "/help-center",
      "/payments",
      "/pending-bookings",
      "/platform-settings",
      "/pricing",
      "/profile-setting",
      "/refunds",
      "/scheduled-bookings",
      "/standard-luggage",
    ]);
  });
});
