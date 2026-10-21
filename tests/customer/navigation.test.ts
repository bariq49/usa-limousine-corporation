import { describe, expect, it } from "vitest";
import { navigation } from "../../apps/customer/config/navigation";

describe("customer navigation", () => {
  it("only links to existing foundation routes", () => {
    const hrefs = navigation.flatMap((section) =>
      section.groups.flatMap((group) => group.items.map((item) => item.href)),
    );
    expect(hrefs.sort()).toEqual(["/dashboard", "/profile-setting"]);
  });
});
