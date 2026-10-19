import { describe, expect, it } from "vitest";
import { formatPrice } from "../../../packages/ui/src/utils/price";
import { APP_CURRENCY } from "../../../packages/ui/src/constants";

describe("formatPrice utility", () => {
  it("formats price with default currency symbol", () => {
    expect(formatPrice({ price: 10 })).toBe(`${APP_CURRENCY}10.00`);
    expect(formatPrice({ price: 25.5 })).toBe(`${APP_CURRENCY}25.50`);
    expect(formatPrice({ price: "100" })).toBe(`${APP_CURRENCY}100.00`);
  });

  it("handles empty or null values gracefully", () => {
    expect(formatPrice({ price: null })).toBe("—");
    expect(formatPrice({ price: undefined })).toBe("—");
    expect(formatPrice({ price: "" })).toBe("—");
    expect(formatPrice()).toBe("—");
    expect(formatPrice({ price: null, fallback: `${APP_CURRENCY}0.00` })).toBe(
      `${APP_CURRENCY}0.00`,
    );
  });

  it("allows custom currency symbol", () => {
    expect(formatPrice({ price: 50, currency: "$" })).toBe("$50.00");
    expect(formatPrice({ price: 100, currency: "€" })).toBe("€100.00");
    expect(formatPrice({ price: 75, currencySymbol: "£" })).toBe("£75.00");
  });
});
