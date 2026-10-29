import { APP_TIMEZONE, formatTime } from "./format-time";
import { formatDate } from "./format-date";

type WallClockParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
};

function localParts(date: Date, timeZone: string) {
  const [year, month, day] = formatDate({ date, as: "value", timeZone }).split("-").map(Number);
  const [hour, minute] = formatTime({ date, as: "value", timeZone }).split(":").map(Number);
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

function wallToUtc(timeZone: string, parts: WallClockParts): Date {
  const { year, month, day, hour, minute, second = 0 } = parts;
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

export function wallClock(timeZone: string, date: string, time: string): Date | null {
  const zone = timeZone.trim() || APP_TIMEZONE;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (!year || !month || !day || hour === undefined || minute === undefined) {
    return null;
  }
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return wallToUtc(zone, { year, month, day, hour, minute });
}
