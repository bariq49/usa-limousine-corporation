import { APP_LOCALE, APP_TIMEZONE } from "./format-time";

type FormatDateProps = {
  date?: Date | string | number | null | undefined;
  as?: "display" | "value";
  timeZone?: string;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function toValidDate(date: FormatDateProps["date"]): Date | null {
  if (!date) return null;
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date;
  const value = String(date).trim();
  if (!value) return null;
  const parsed = new Date(DATE_ONLY.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(props: FormatDateProps = {}): string {
  const validDate = toValidDate(props.date ?? new Date());
  if (!validDate) return "—";

  const isCalendar = typeof props.date === "string" && DATE_ONLY.test(props.date.trim());
  const timeZone = isCalendar ? "UTC" : (props.timeZone ?? APP_TIMEZONE);

  if (props.as === "value") {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(validDate);
    const year = parts.find((part) => part.type === "year")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const day = parts.find((part) => part.type === "day")?.value ?? "";
    return `${year}-${month}-${day}`;
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(validDate);
}
