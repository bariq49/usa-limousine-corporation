import { BadRequestException } from "@nestjs/common";
import { formatDate } from "../../../common/utils/format-date";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { dayBounds } from "../../../common/utils/day-bounds";
import type { Filter, GroupBy, SeriesBucket } from "../types/activity";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymdParts(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0 };
}

function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addCalendarDays(ymd: string, delta: number): string {
  const { year, month, day } = ymdParts(ymd);
  const dt = new Date(Date.UTC(year, month - 1, day + delta, 12, 0, 0));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function addCalendarMonths(year: number, month: number, delta: number) {
  const idx = year * 12 + (month - 1) + delta;
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;
  return { year: y, month: m };
}

function probeAt(ymd: string): Date {
  const { year, month, day } = ymdParts(ymd);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function startOfDay(ymd: string, timeZone: string): Date {
  return dayBounds(timeZone, probeAt(ymd)).start;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MAX_DAY_BUCKETS = 93;
const MAX_MONTH_BUCKETS = 36;
const MAX_YEAR_BUCKETS = 20;

export type ResolvedActivityWindow = {
  start: Date;
  end: Date;
  startDate: string;
  endDate: string;
  groupBy: GroupBy;
  timezone: string;
};

function daysBetween(startYmd: string, endExclusiveYmd: string): number {
  const a = ymdParts(startYmd);
  const b = ymdParts(endExclusiveYmd);
  const ms = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function inferGroupBy(startYmd: string, endExclusiveYmd: string): GroupBy {
  const days = daysBetween(startYmd, endExclusiveYmd);
  if (days <= 45) {
    return "day";
  }
  if (days <= 800) {
    return "month";
  }
  return "year";
}

function clampGroupBy(groupBy: GroupBy, startYmd: string, endExclusiveYmd: string): GroupBy {
  const days = daysBetween(startYmd, endExclusiveYmd);
  if (groupBy === "day" && days > MAX_DAY_BUCKETS) {
    return days > 800 ? "year" : "month";
  }
  if (groupBy === "month") {
    const { year: sy, month: sm } = ymdParts(startYmd);
    const { year: ey, month: em } = ymdParts(endExclusiveYmd);
    const months = ey * 12 + em - (sy * 12 + sm);
    if (months > MAX_MONTH_BUCKETS) {
      return "year";
    }
  }
  return groupBy;
}

/**
 * Resolve filter window from APIFeature-style query params.
 * Precedence: `day` → `year`+`month` → `year` → `startDate`/`endDate` → current month.
 */
export function resolveActivityWindow(
  filter: Filter,
  timeZone: string = APP_TIMEZONE,
  now: Date = new Date(),
): ResolvedActivityWindow {
  const zone = timeZone.trim() || APP_TIMEZONE;
  const today = formatDate(now, zone);
  const { year: currentYear, month: currentMonth } = ymdParts(today);

  let startYmd: string;
  let endExclusiveYmd: string;
  let requestedGroupBy = filter.groupBy;

  if (filter.day) {
    if (!isYmd(filter.day)) {
      throw new BadRequestException("day must be YYYY-MM-DD");
    }
    startYmd = filter.day;
    endExclusiveYmd = addCalendarDays(filter.day, 1);
    requestedGroupBy = requestedGroupBy ?? "day";
  } else if (filter.month !== undefined) {
    const year = filter.year ?? currentYear;
    if (filter.month < 1 || filter.month > 12) {
      throw new BadRequestException("month must be 1–12");
    }
    startYmd = `${year}-${pad2(filter.month)}-01`;
    const next = addCalendarMonths(year, filter.month, 1);
    endExclusiveYmd = `${next.year}-${pad2(next.month)}-01`;
    requestedGroupBy = requestedGroupBy ?? "day";
  } else if (filter.year !== undefined) {
    startYmd = `${filter.year}-01-01`;
    endExclusiveYmd = `${filter.year + 1}-01-01`;
    requestedGroupBy = requestedGroupBy ?? "month";
  } else if (filter.startDate || filter.endDate) {
    const startRaw = filter.startDate?.trim();
    const endRaw = filter.endDate?.trim();
    if (startRaw && !isYmd(startRaw)) {
      throw new BadRequestException("startDate must be YYYY-MM-DD");
    }
    if (endRaw && !isYmd(endRaw)) {
      throw new BadRequestException("endDate must be YYYY-MM-DD");
    }
    startYmd = startRaw || addCalendarDays(endRaw || today, -29);
    const endInclusive = endRaw || today;
    endExclusiveYmd = addCalendarDays(endInclusive, 1);
    if (startYmd >= endExclusiveYmd) {
      throw new BadRequestException("startDate must be before endDate");
    }
    requestedGroupBy = requestedGroupBy ?? inferGroupBy(startYmd, endExclusiveYmd);
  } else {
    startYmd = `${currentYear}-${pad2(currentMonth)}-01`;
    const next = addCalendarMonths(currentYear, currentMonth, 1);
    endExclusiveYmd = `${next.year}-${pad2(next.month)}-01`;
    requestedGroupBy = requestedGroupBy ?? "day";
  }

  const groupBy = clampGroupBy(requestedGroupBy ?? "day", startYmd, endExclusiveYmd);
  const start = startOfDay(startYmd, zone);
  const end = startOfDay(endExclusiveYmd, zone);

  return {
    start,
    end,
    startDate: startYmd,
    endDate: addCalendarDays(endExclusiveYmd, -1),
    groupBy,
    timezone: zone,
  };
}

export function emptySeriesForWindow(window: ResolvedActivityWindow): SeriesBucket[] {
  const { start, end, groupBy, timezone } = window;
  const buckets: SeriesBucket[] = [];

  if (groupBy === "day") {
    let cursor = formatDate(start, timezone);
    const endYmd = formatDate(end, timezone);
    let guard = 0;
    while (cursor < endYmd && guard < MAX_DAY_BUCKETS) {
      const { day } = ymdParts(cursor);
      buckets.push({
        key: cursor,
        label: String(day),
        finished: 0,
        incoming: 0,
      });
      cursor = addCalendarDays(cursor, 1);
      guard += 1;
    }
    return buckets;
  }

  if (groupBy === "month") {
    let { year, month } = ymdParts(formatDate(start, timezone));
    const endParts = ymdParts(formatDate(end, timezone));
    let guard = 0;
    while (year * 12 + month < endParts.year * 12 + endParts.month && guard < MAX_MONTH_BUCKETS) {
      buckets.push({
        key: `${year}-${pad2(month)}`,
        label: `${MONTH_LABELS[month - 1] ?? pad2(month)} ${year}`,
        finished: 0,
        incoming: 0,
      });
      const next = addCalendarMonths(year, month, 1);
      year = next.year;
      month = next.month;
      guard += 1;
    }
    return buckets;
  }

  let year = ymdParts(formatDate(start, timezone)).year;
  const endYear = ymdParts(formatDate(end, timezone)).year;
  let guard = 0;
  while (year < endYear && guard < MAX_YEAR_BUCKETS) {
    buckets.push({
      key: String(year),
      label: String(year),
      finished: 0,
      incoming: 0,
    });
    year += 1;
    guard += 1;
  }
  return buckets;
}

export function bucketKeyForGroup(groupBy: GroupBy, date: Date, timeZone: string): string {
  const zone = timeZone.trim() || APP_TIMEZONE;
  const ymd = formatDate(date, zone);
  if (groupBy === "day") {
    return ymd;
  }
  const { year, month } = ymdParts(ymd);
  if (groupBy === "month") {
    return `${year}-${pad2(month)}`;
  }
  return String(year);
}
