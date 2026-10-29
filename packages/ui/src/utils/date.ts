import type {
  FormatDateProps,
  FormatDateTimeProps,
  FormatRelativeTimeProps,
  FormatTimeProps,
  ToValidDateProps,
} from "../types/date";
import { APP_LOCALE, DATE_FORMAT, TIME_FORMAT } from "../constants/index";

const TIME_ONLY_PATTERN = /^\d{1,2}:\d{2}(:\d{2})?$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isTimeOnlyValue(date: FormatTimeProps["date"]): boolean {
  return typeof date === "string" && TIME_ONLY_PATTERN.test(date.trim());
}

function resolveLocale(locale?: string): string {
  return locale ?? APP_LOCALE;
}

function resolveTimeOptions(
  date: FormatTimeProps["date"],
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  if (options) return options;
  if (!isTimeOnlyValue(date)) return TIME_FORMAT;

  return Object.assign({}, TIME_FORMAT, { timeZone: "UTC" });
}

export function toValidDate(props?: ToValidDateProps): Date | null {
  const date = props?.date;
  if (!date) return null;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const value = String(date).trim();
  if (!value) return null;

  if (TIME_ONLY_PATTERN.test(value)) {
    const parsedTime = new Date(`1970-01-01T${value}Z`);
    return Number.isNaN(parsedTime.getTime()) ? null : parsedTime;
  }

  const parsed = new Date(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(props?: FormatDateProps): string {
  const validDate = toValidDate({ date: props?.date });
  if (!validDate) return "—";

  const options = props?.options ?? DATE_FORMAT;
  const isCalendarDate =
    typeof props?.date === "string" && DATE_ONLY_PATTERN.test(props.date.trim());

  return new Intl.DateTimeFormat(
    resolveLocale(props?.locale),
    isCalendarDate ? Object.assign({}, options, { timeZone: "UTC" }) : options,
  ).format(validDate);
}

export function formatTime(props?: FormatTimeProps): string {
  const date = props?.date;
  const validDate = toValidDate({ date });
  if (!validDate) return "—";

  return new Intl.DateTimeFormat(
    resolveLocale(props?.locale),
    resolveTimeOptions(date, props?.options),
  ).format(validDate);
}

export function formatDateTime(props?: FormatDateTimeProps): string {
  const formattedDate = formatDate({
    date: props?.date,
    locale: props?.locale,
    options: props?.options,
  });
  const formattedTime = formatTime({
    date: props?.date,
    locale: props?.locale,
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
