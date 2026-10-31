import { describe, expect, it } from "vitest";
import { navigation } from "../../apps/customer/config/navigation";

describe("customer navigation", () => {
  it("only links to existing foundation routes", () => {
    const hrefs = navigation.flatMap((section) =>
      section.groups.flatMap((group) => group.items.map((item) => item.href)),
    );
    expect(hrefs.sort()).toEqual([
      "/bookings",
      "/calendar",
      "/cancelled-bookings",
      "/completed-bookings",
      "/confirmed-bookings",
      "/dashboard",
      "/help-center",
      "/notifications",
      "/payments",
      "/pending-bookings",
      "/profile-setting",
      "/refunds",
    ]);
  });
});
