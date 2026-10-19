import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  toValidDate,
} from "../../../packages/ui/src/utils/date";

describe("date utils with single prop destructuring", () => {
  const sampleIso = "2026-09-17T17:09:18.000Z";

  it("handles null or invalid inputs gracefully", () => {
    expect(toValidDate({ date: null })).toBeNull();
    expect(toValidDate({ date: "invalid-date" })).toBeNull();
    expect(formatDate({ date: null })).toBe("—");
    expect(formatDate({})).toBe("—");
    expect(formatTime({ date: "invalid" })).toBe("—");
    expect(formatDateTime({ date: undefined })).toBe("—");
    expect(formatRelativeTime({ date: null })).toBe("—");
  });

  it("formats date with single prop object", () => {
    const formatted = formatDate({ date: sampleIso });
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Sep");
  });

  it("formats time with single prop object", () => {
    const formatted = formatTime({ date: sampleIso });
    expect(formatted).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)?/);
  });

  it("formats date and time together with single prop object", () => {
    const formatted = formatDateTime({ date: sampleIso });
    expect(formatted).toContain("Sep");
    expect(formatted).toContain("2026");
  });

  it("formats relative time correctly with single prop object", () => {
    const now = Date.now();
    expect(formatRelativeTime({ date: new Date(now - 30 * 1000) })).toBe("Just now");
    expect(formatRelativeTime({ date: new Date(now - 5 * 60 * 1000) })).toBe("5m ago");
    expect(formatRelativeTime({ date: new Date(now - 3 * 3600 * 1000) })).toBe("3h ago");
    expect(formatRelativeTime({ date: new Date(now - 2 * 86400 * 1000) })).toBe("2d ago");
  });

  it("supports options and locale in single prop", () => {
    const customFormatted = formatDate({
      date: sampleIso,
      options: { year: "numeric", month: "long" },
      locale: "en-US",
    });
    expect(customFormatted).toContain("September");
    expect(customFormatted).toContain("2026");
  });
});
