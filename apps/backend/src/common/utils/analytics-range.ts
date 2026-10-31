import { formatDate } from "./format-date";
import { APP_TIMEZONE } from "./format-time";

export const ANALYTICS_RANGES = ["12h", "24h", "7d", "15d", "30d", "month", "year"] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const ANALYTICS_SHORT_RANGES = ["12h", "24h", "7d", "15d"] as const;

export type AnalyticsShortRange = (typeof ANALYTICS_SHORT_RANGES)[number];

export type AnalyticsBucket = {
  label: string;
  start: Date;
  end: Date;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatHourLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "numeric",
    hour12: true,
  }).format(date);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function analyticsRangeBuckets(range: AnalyticsRange): AnalyticsBucket[] {
  const now = new Date();

  if (range === "12h" || range === "24h") {
    const hours = range === "12h" ? 12 : 24;
    const end = new Date(now);
    end.setMinutes(0, 0, 0);
    return Array.from({ length: hours }, (_, index) => {
      const start = new Date(end.getTime() - (hours - 1 - index) * 60 * 60 * 1000);
      const next = new Date(start.getTime() + 60 * 60 * 1000);
      return { label: formatHourLabel(start), start, end: next };
    });
  }

  if (range === "7d" || range === "15d" || range === "30d") {
    const days = range === "7d" ? 7 : range === "15d" ? 15 : 30;
    const today = formatDate({ as: "value" });
    const todayUtc = new Date(`${today}T00:00:00Z`);
    return Array.from({ length: days }, (_, index) => {
      const start = new Date(
        Date.UTC(
          todayUtc.getUTCFullYear(),
          todayUtc.getUTCMonth(),
          todayUtc.getUTCDate() - (days - 1 - index),
        ),
      );
      const end = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 1),
      );
      return { label: formatDayLabel(start), start, end };
    });
  }

  if (range === "month") {
    const today = formatDate({ as: "value" });
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    const dayToday = Number(today.slice(8, 10));
    return Array.from({ length: dayToday }, (_, index) => {
      const day = index + 1;
      const start = new Date(Date.UTC(year, month - 1, day));
      const end = new Date(Date.UTC(year, month - 1, day + 1));
      return { label: String(day), start, end };
    });
  }

  const year = Number(formatDate({ as: "value" }).slice(0, 4));
  return MONTHS.map((label, index) => ({
    label,
    start: new Date(Date.UTC(year, index, 1)),
    end: new Date(Date.UTC(year, index + 1, 1)),
  }));
}

export function analyticsRangeBounds(range: AnalyticsRange) {
  const buckets = analyticsRangeBuckets(range);
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  if (!first || !last) {
    throw new Error("Unsupported analytics range");
  }
  return { start: first.start, end: last.end, buckets, labels: buckets.map((item) => item.label) };
}

export function analyticsCalendarBuckets(year: number, month?: number | null): AnalyticsBucket[] {
  if (month) {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const today = formatDate({ as: "value" });
    const currentYear = Number(today.slice(0, 4));
    const currentMonth = Number(today.slice(5, 7));
    const currentDay = Number(today.slice(8, 10));
    const maxDay =
      year === currentYear && month === currentMonth ? Math.min(daysInMonth, currentDay) : daysInMonth;

    return Array.from({ length: maxDay }, (_, index) => {
      const day = index + 1;
      const start = new Date(Date.UTC(year, month - 1, day));
      const end = new Date(Date.UTC(year, month - 1, day + 1));
      return { label: String(day), start, end };
    });
  }

  return MONTHS.map((label, index) => ({
    label,
    start: new Date(Date.UTC(year, index, 1)),
    end: new Date(Date.UTC(year, index + 1, 1)),
  }));
}

export function analyticsCalendarBounds(year: number, month?: number | null) {
  const buckets = analyticsCalendarBuckets(year, month);
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  if (!first || !last) {
    throw new Error("Unsupported analytics calendar");
  }
  return { start: first.start, end: last.end, buckets, labels: buckets.map((item) => item.label) };
}

function analyticsAnchorEnd(year: number, month?: number | null) {
  const today = formatDate({ as: "value" });
  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7));
  const now = new Date();

  if (month) {
    if (year === currentYear && month === currentMonth) {
      return now;
    }
    return new Date(Date.UTC(year, month, 1));
  }

  if (year === currentYear) {
    return now;
  }

  return new Date(Date.UTC(year + 1, 0, 1));
}

export function analyticsAnchoredRangeBuckets(
  range: AnalyticsShortRange,
  year: number,
  month?: number | null,
): AnalyticsBucket[] {
  const end = analyticsAnchorEnd(year, month);

  if (range === "12h" || range === "24h") {
    const hours = range === "12h" ? 12 : 24;
    const hourEnd = new Date(end);
    hourEnd.setMinutes(0, 0, 0);
    return Array.from({ length: hours }, (_, index) => {
      const start = new Date(hourEnd.getTime() - (hours - 1 - index) * 60 * 60 * 1000);
      const next = new Date(start.getTime() + 60 * 60 * 1000);
      return { label: formatHourLabel(start), start, end: next };
    });
  }

  const days = range === "7d" ? 7 : 15;
  const endDay = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  return Array.from({ length: days }, (_, index) => {
    const start = new Date(
      Date.UTC(
        endDay.getUTCFullYear(),
        endDay.getUTCMonth(),
        endDay.getUTCDate() - (days - 1 - index),
      ),
    );
    const next = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 1),
    );
    return { label: formatDayLabel(start), start, end: next };
  });
}

export function analyticsAnchoredRangeBounds(
  range: AnalyticsShortRange,
  year: number,
  month?: number | null,
) {
  const buckets = analyticsAnchoredRangeBuckets(range, year, month);
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  if (!first || !last) {
    throw new Error("Unsupported analytics short range");
  }
  return { start: first.start, end: last.end, buckets, labels: buckets.map((item) => item.label) };
}

export function analyticsBucketIndex(buckets: AnalyticsBucket[], at: Date) {
  return buckets.findIndex((bucket) => at >= bucket.start && at < bucket.end);
}

export const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  "12h": "Last 12 hours",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "15d": "Last 15 days",
  "30d": "Last 30 days",
  month: "This month",
  year: "This year",
};
