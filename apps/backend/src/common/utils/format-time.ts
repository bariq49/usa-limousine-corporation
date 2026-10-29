import { PLATFORM } from "@usa-limousine-corporation/config";

export const APP_TIMEZONE = PLATFORM.locale.timezone;
export const APP_LOCALE = PLATFORM.locale.locale;

type FormatTimeProps = {
  date?: Date | string | number | null | undefined;
  as?: "display" | "value";
  hourCycle?: "12h" | "24h";
  timeZone?: string;
};

const TIME_ONLY = /^\d{1,2}:\d{2}(:\d{2})?$/;

function toValidDate(date: FormatTimeProps["date"]): Date | null {
  if (!date) return null;
  if (date instanceof Date) return Number.isNaN(date.getTime()) ? null : date;
  const value = String(date).trim();
  if (!value) return null;
  if (TIME_ONLY.test(value)) {
    const parsed = new Date(`1970-01-01T${value.padStart(5, "0").slice(0, 5)}:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTime(props: FormatTimeProps = {}): string {
  const validDate = toValidDate(props.date ?? new Date());
  if (!validDate) return "—";

  const timeZone =
    typeof props.date === "string" && TIME_ONLY.test(props.date.trim())
      ? "UTC"
      : (props.timeZone ?? APP_TIMEZONE);

  if (props.as === "value") {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(validDate);
    const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
    const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
    return `${hour === "24" ? "00" : hour}:${minute}`;
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: props.hourCycle !== "24h",
  }).format(validDate);
}
