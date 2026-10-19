import { SubscriptionInterval } from "@prisma/client";
import { formatDate } from "../../../common/utils/format-date";
import { APP_TIMEZONE, formatTime } from "../../../common/utils/format-time";

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zone(timeZone?: string): string {
  return timeZone?.trim() || APP_TIMEZONE;
}

function localParts(date: Date, timeZone: string): LocalParts {
  const [year, month, day] = formatDate(date, timeZone).split("-").map(Number);
  const [hour, minute] = formatTime(date, timeZone).split(":").map(Number);
  const second = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .find((part) => part.type === "second")?.value ?? "0",
  );

  return {
    year: year ?? 0,
    month: month ?? 0,
    day: day ?? 0,
    hour: hour ?? 0,
    minute: minute ?? 0,
    second,
  };
}

/** Convert a wall-clock datetime in `timeZone` to a UTC Date (same approach as day-bounds). */
function wallToUtc(timeZone: string, parts: LocalParts): Date {
  const { year, month, day, hour, minute, second } = parts;
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let i = 0; i < 3; i += 1) {
    const local = localParts(new Date(utc), timeZone);
    const asUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    utc += Date.UTC(year, month - 1, day, hour, minute, second) - asUtc;
  }
  return new Date(utc);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Add exact calendar months in the given timezone (default Europe/Amsterdam).
 * Preserves local wall time; clamps day when the target month is shorter (Jan 31 → Feb 28/29).
 */
export function addCalendarMonths(
  from: Date,
  months: number,
  timeZone: string = APP_TIMEZONE,
): Date {
  const tz = zone(timeZone);
  const local = localParts(from, tz);
  const absoluteMonth = local.month - 1 + months;
  const year = local.year + Math.floor(absoluteMonth / 12);
  const month = ((absoluteMonth % 12) + 12) % 12; // 0-based
  const day = Math.min(local.day, daysInMonth(year, month + 1));
  return wallToUtc(tz, {
    year,
    month: month + 1,
    day,
    hour: local.hour,
    minute: local.minute,
    second: local.second,
  });
}

/** Advance `from` by whole calendar days in the app timezone (preserves local wall time). */
export function addCalendarDays(from: Date, days: number, timeZone: string = APP_TIMEZONE): Date {
  const tz = zone(timeZone);
  const local = localParts(from, tz);
  const startDay = Date.UTC(local.year, local.month - 1, local.day);
  const next = new Date(startDay + days * 24 * 60 * 60 * 1000);
  return wallToUtc(tz, {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
    hour: local.hour,
    minute: local.minute,
    second: local.second,
  });
}

/** Months to add for a plan billing interval (YEAR → 12). */
export function intervalMonths(interval: SubscriptionInterval): number {
  return interval === SubscriptionInterval.YEAR ? 12 : 1;
}

/** Advance `from` by one plan interval in the app timezone. */
export function addPlanInterval(
  from: Date,
  interval: SubscriptionInterval,
  timeZone: string = APP_TIMEZONE,
): Date {
  return addCalendarMonths(from, intervalMonths(interval), timeZone);
}

/**
 * Whole calendar days remaining until `end` in the given timezone (default Europe/Amsterdam).
 * Returns 0 when ended; null when `end` is missing.
 */
export function daysLeftUntil(
  end: Date | null | undefined,
  now: Date = new Date(),
  timeZone: string = APP_TIMEZONE,
): number | null {
  if (!end) {
    return null;
  }
  const tz = zone(timeZone);
  const startLocal = localParts(now, tz);
  const endLocal = localParts(end, tz);
  const startDay = Date.UTC(startLocal.year, startLocal.month - 1, startLocal.day);
  const endDay = Date.UTC(endLocal.year, endLocal.month - 1, endLocal.day);
  const days = Math.round((endDay - startDay) / (24 * 60 * 60 * 1000));
  return days <= 0 ? 0 : days;
}
