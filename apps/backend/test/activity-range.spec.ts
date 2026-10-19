import {
  bucketKeyForGroup,
  emptySeriesForWindow,
  resolveActivityWindow,
} from "../src/modules/driver/utils/activity-range";

describe("activity-range filters", () => {
  const now = new Date("2026-09-17T15:00:00.000Z");

  it("resolves a single month with day buckets", () => {
    const window = resolveActivityWindow({ year: 2026, month: 8 }, "UTC", now);
    expect(window.startDate).toBe("2026-08-01");
    expect(window.endDate).toBe("2026-08-31");
    expect(window.groupBy).toBe("day");
    const series = emptySeriesForWindow(window);
    expect(series).toHaveLength(31);
    expect(series[0]?.key).toBe("2026-08-01");
    expect(series[30]?.key).toBe("2026-08-31");
  });

  it("resolves a year with month buckets", () => {
    const window = resolveActivityWindow({ year: 2026 }, "UTC", now);
    expect(window.startDate).toBe("2026-01-01");
    expect(window.endDate).toBe("2026-12-31");
    expect(window.groupBy).toBe("month");
    expect(emptySeriesForWindow(window)).toHaveLength(12);
  });

  it("resolves startDate/endDate range", () => {
    const window = resolveActivityWindow(
      { startDate: "2026-07-01", endDate: "2026-09-30", groupBy: "month" },
      "UTC",
      now,
    );
    expect(window.startDate).toBe("2026-07-01");
    expect(window.endDate).toBe("2026-09-30");
    expect(window.groupBy).toBe("month");
    expect(emptySeriesForWindow(window).map((s) => s.key)).toEqual([
      "2026-07",
      "2026-08",
      "2026-09",
    ]);
  });

  it("resolves a single day", () => {
    const window = resolveActivityWindow({ day: "2026-09-15" }, "UTC", now);
    expect(window.startDate).toBe("2026-09-15");
    expect(window.endDate).toBe("2026-09-15");
    expect(emptySeriesForWindow(window)).toHaveLength(1);
  });

  it("bucketKeyForGroup matches series keys", () => {
    expect(bucketKeyForGroup("day", new Date("2026-08-05T00:00:00.000Z"), "UTC")).toBe(
      "2026-08-05",
    );
    expect(bucketKeyForGroup("month", new Date("2026-08-05T00:00:00.000Z"), "UTC")).toBe("2026-08");
    expect(bucketKeyForGroup("year", new Date("2026-08-05T00:00:00.000Z"), "UTC")).toBe("2026");
  });
});
