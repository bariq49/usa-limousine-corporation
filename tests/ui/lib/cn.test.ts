import { describe, expect, it } from "vitest";
import { cn, getInitials, isLocationMatch } from "../../../packages/ui/src/utils/cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("getInitials", () => {
  it("uses a neutral fallback when the name is empty", () => {
    expect(getInitials("")).toBe("?");
  });

  it("takes the first letters of two words", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });
});

describe("isLocationMatch", () => {
  it("matches nested paths", () => {
    expect(isLocationMatch("/profile", "/profile/settings")).toBe(true);
    expect(isLocationMatch("/dashboard", "/profile")).toBe(false);
  });
});
