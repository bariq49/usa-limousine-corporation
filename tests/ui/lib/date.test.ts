import { describe, expect, it } from "vitest";
import {
  addMinutes,
  calculateArrivalTime,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  shiftDateTime,
  toValidDate,
  validateBookingTime,
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

  it("shifts wall-clock date and time by minutes", () => {
    expect(shiftDateTime({ date: "2026-08-24", time: "22:30", minutes: -60 })).toEqual({
      date: "2026-08-24",
      time: "21:30",
    });
    expect(shiftDateTime({ date: "2026-08-25", time: "00:15", minutes: -30 })).toEqual({
      date: "2026-08-24",
      time: "23:45",
    });
  });

  it("adds minutes to a date", () => {
    const earlier = addMinutes({ date: "2026-08-25T02:30:00.000Z", minutes: -60 });
    expect(earlier?.toISOString()).toBe("2026-08-25T01:30:00.000Z");
  });

  it("formats clock times and arrival times with hourCycle", () => {
    expect(formatTime({ date: "14:30", hourCycle: "12h" })).toMatch(/2:30\s*PM/i);
    expect(formatTime({ date: "14:30", hourCycle: "24h" })).toBe("14:30");
    expect(calculateArrivalTime({ time: "14:30", durationMinutes: 45, hourCycle: "24h" })).toBe(
      "15:15",
    );
    expect(calculateArrivalTime({ time: "14:30", durationMinutes: 45, hourCycle: "12h" })).toMatch(
      /3:15\s*PM/i,
    );
  });

  it("validates booking pickup notice window", () => {
    expect(validateBookingTime({ date: "", time: "", minBookingMinutes: 60 })).toEqual({
      isValid: true,
    });

    const past = validateBookingTime({
      date: "2020-01-01",
      time: "12:00",
      minBookingMinutes: 60,
    });
    expect(past.isValid).toBe(false);
    expect(past.isPast).toBe(true);
  });
});
