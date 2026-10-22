import { describe, expect, it } from "vitest";
import { formatPrice } from "../../../packages/ui/src/utils/price";
import { formatDistance } from "../../../packages/ui/src/utils/distance";
import { formatDateTime } from "../../../packages/ui/src/utils/date";

describe("US display defaults", () => {
  it("shows prices in US dollars", () => {
    expect(formatPrice({ price: 42.5 })).toBe("$42.50");
  });

  it("shows distances in miles", () => {
    expect(formatDistance({ distance: 12.34 })).toBe("12.3 mile");
  });

  it("shows times in US Eastern", () => {
    // 2026-07-01 16:00 UTC is 12:00 PM in New York (EDT, UTC-4).
    expect(formatDateTime({ date: "2026-07-01T16:00:00Z" })).toContain("12:00 PM");
  });
});
