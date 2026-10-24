import { describe, expect, it } from "vitest";
import { cn, isLocationMatch } from "../../../packages/ui/src/utils/cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("isLocationMatch", () => {
  it("matches nested paths", () => {
    expect(isLocationMatch("/profile", "/profile/settings")).toBe(true);
    expect(isLocationMatch("/dashboard", "/profile")).toBe(false);
  });
});
