export const APP_TIMEZONE = "Europe/Amsterdam";

export function formatTime(date: Date = new Date(), timeZone: string = APP_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timeZone || APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const normalizedHour = hour === "24" ? "00" : hour;
  return `${normalizedHour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}
