import type {
  AddMinutesProps,
  CalculateArrivalTimeProps,
  FormatDateProps,
  FormatDateTimeProps,
  FormatRelativeTimeProps,
  FormatTimeProps,
  HourCycle,
  ShiftDateTimeProps,
  ToValidDateProps,
  ValidateBookingTimeProps,
  ValidateBookingTimeResult,
} from "../types/date";
import { APP_LOCALE, APP_TIMEZONE, DATE_FORMAT, TIME_FORMAT } from "../constants/index";

const TIME_ONLY_PATTERN = /^\d{1,2}:\d{2}(:\d{2})?$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_12H_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

function isClockTimeValue(date: FormatTimeProps["date"]): boolean {
  if (typeof date !== "string") return false;
  const value = date.trim();
  return TIME_ONLY_PATTERN.test(value) || TIME_12H_PATTERN.test(value);
}

function isCalendarDateValue(date: FormatDateProps["date"]): boolean {
  return typeof date === "string" && DATE_ONLY_PATTERN.test(date.trim());
}

function resolveLocale(locale?: string): string {
  return locale ?? APP_LOCALE;
}

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function withAppTimezone(
  base: Intl.DateTimeFormatOptions,
  options: Intl.DateTimeFormatOptions | undefined,
  timeZone: string,
): Intl.DateTimeFormatOptions {
  return Object.assign({}, base, options ?? {}, { timeZone });
}

function hourCycleOptions(hourCycle?: HourCycle): Intl.DateTimeFormatOptions | undefined {
  if (hourCycle === "24h") return { hour12: false, hourCycle: "h23" };
  if (hourCycle === "12h") return { hour12: true };
  return undefined;
}

function zonedParts(date: Date, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat(
    "en-US",
    withAppTimezone({}, options, APP_TIMEZONE),
  ).formatToParts(date);
}

function toHourMinute(time: string): string | null {
  const value = time.trim();
  const match12 = value.match(TIME_12H_PATTERN);
  if (match12) {
    let hour = Number(match12[1]);
    const minute = Number(match12[2]);
    const period = (match12[3] ?? "").toUpperCase();
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  if (!TIME_ONLY_PATTERN.test(value)) return null;
  const [hourPart = "0", minutePart = "0"] = value.split(":");
  return `${hourPart.padStart(2, "0")}:${minutePart.padStart(2, "0")}`;
}

function dateTimeValue(date: string, time: string): string {
  return `${date} ${time}`;
}

function nowDateTimeValue(): string {
  const now = new Date();
  return dateTimeValue(
    formatDate({ date: now, as: "value" }),
    formatTime({ date: now, as: "value" }),
  );
}

export function toValidDate(props?: ToValidDateProps): Date | null {
  const date = props?.date;
  if (!date) return null;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const value = String(date).trim();
  if (!value) return null;

  const clock = toHourMinute(value);
  if (clock && isClockTimeValue(value)) {
    const parsedTime = new Date(`1970-01-01T${clock}:00Z`);
    return Number.isNaN(parsedTime.getTime()) ? null : parsedTime;
  }

  const parsed = new Date(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(props?: FormatDateProps): string {
  const validDate = toValidDate({ date: props?.date });
  if (!validDate) return "—";

  if (props?.as === "value") {
    const parts = zonedParts(validDate, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return `${getPart(parts, "year")}-${getPart(parts, "month")}-${getPart(parts, "day")}`;
  }

  return new Intl.DateTimeFormat(
    resolveLocale(props?.locale),
    withAppTimezone(
      DATE_FORMAT,
      props?.options,
      isCalendarDateValue(props?.date) ? "UTC" : APP_TIMEZONE,
    ),
  ).format(validDate);
}

export function formatTime(props?: FormatTimeProps): string {
  const date = props?.date;
  const validDate = toValidDate({ date });
  if (!validDate) return "—";

  if (props?.as === "value") {
    if (isClockTimeValue(date)) {
      return toHourMinute(String(date).trim()) ?? "—";
    }
    const parts = zonedParts(validDate, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    return `${getPart(parts, "hour")}:${getPart(parts, "minute")}`;
  }

  const options = Object.assign({}, hourCycleOptions(props?.hourCycle), props?.options ?? {});

  return new Intl.DateTimeFormat(
    resolveLocale(props?.locale),
    withAppTimezone(TIME_FORMAT, options, isClockTimeValue(date) ? "UTC" : APP_TIMEZONE),
  ).format(validDate);
}

export function formatDateTime(props?: FormatDateTimeProps): string {
  if (props?.as === "value") {
    const date = formatDate({ date: props?.date, as: "value" });
    const time = formatTime({ date: props?.date, as: "value" });
    if (date === "—" || time === "—") return "—";
    return `${date} ${time}`;
  }

  const formattedDate = formatDate({
    date: props?.date,
    locale: props?.locale,
    options: props?.options,
  });

  const timeOptions = props?.options
    ? {
        hour: props.options.hour,
        minute: props.options.minute,
        second: props.options.second,
        hour12: props.options.hour12,
        hourCycle: props.options.hourCycle,
      }
    : undefined;

  const formattedTime = formatTime({
    date: props?.date,
    locale: props?.locale,
    hourCycle: props?.hourCycle,
    options: timeOptions,
  });

  if (formattedDate === "—" || formattedTime === "—") return "—";
  return `${formattedDate}, ${formattedTime}`;
}

export function formatRelativeTime(props?: FormatRelativeTimeProps): string {
  const validDate = toValidDate({ date: props?.date });
  if (!validDate) return "—";

  const diffSec = Math.floor((Date.now() - validDate.getTime()) / 1000);
  if (diffSec < 0 || diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  return `${Math.floor(diffMonths / 12)}y ago`;
}

export function addMinutes(props: AddMinutesProps): Date | null {
  const validDate = toValidDate({ date: props.date });
  if (!validDate) return null;
  return new Date(validDate.getTime() + props.minutes * 60_000);
}

export function shiftDateTime(
  props: ShiftDateTimeProps,
): { date: string; time: string } | null {
  const date = props.date?.trim() ?? "";
  const time = toHourMinute(props.time?.trim() ?? "");
  if (!DATE_ONLY_PATTERN.test(date) || !time) return null;

  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(3, 5));
  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) return null;

  const shifted = new Date(Date.UTC(year, month - 1, day, hour, minute) + props.minutes * 60_000);
  if (Number.isNaN(shifted.getTime())) return null;

  return {
    date: [
      String(shifted.getUTCFullYear()),
      String(shifted.getUTCMonth() + 1).padStart(2, "0"),
      String(shifted.getUTCDate()).padStart(2, "0"),
    ].join("-"),
    time: [
      String(shifted.getUTCHours()).padStart(2, "0"),
      String(shifted.getUTCMinutes()).padStart(2, "0"),
    ].join(":"),
  };
}

export function calculateArrivalTime(props?: CalculateArrivalTimeProps): string {
  const clock = toHourMinute(props?.time?.trim() ?? "");
  if (!clock || typeof props?.durationMinutes !== "number") return "—";

  const [hour = 0, minute = 0] = clock.split(":").map(Number);
  const total =
    (((hour * 60 + minute + Math.round(props.durationMinutes)) % 1440) + 1440) % 1440;
  const arrival = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

  return formatTime({ date: arrival, hourCycle: props.hourCycle });
}

export function validateBookingTime(
  props: ValidateBookingTimeProps,
): ValidateBookingTimeResult {
  const date = props.date?.trim() ?? "";
  const time = toHourMinute(props.time?.trim() ?? "");
  if (!date || !time || !DATE_ONLY_PATTERN.test(date)) return { isValid: true };

  const pickupValue = dateTimeValue(date, time);
  const nowValue = nowDateTimeValue();

  if (pickupValue <= nowValue) {
    return { isValid: false, isPast: true };
  }

  const earliest = addMinutes({ date: new Date(), minutes: props.minBookingMinutes });
  if (!earliest) return { isValid: true };

  const earliestValue = dateTimeValue(
    formatDate({ date: earliest, as: "value" }),
    formatTime({ date: earliest, as: "value" }),
  );

  if (pickupValue < earliestValue) {
    const hours = props.minBookingMinutes / 60;
    const timeDisplay =
      hours >= 1
        ? `${hours % 1 === 0 ? hours : hours.toFixed(1)} hours`
        : `${props.minBookingMinutes} minutes`;

    return { isValid: false, timeDisplay };
  }

  return { isValid: true };
}
