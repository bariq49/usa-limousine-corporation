import { DriverShift } from "@prisma/client";
import { formatDate } from "../../../common/utils/format-date";
import { APP_TIMEZONE, formatTime } from "../../../common/utils/format-time";
import type {
  CalculateExtraSecondsInput,
  LocalDateParts,
  ShiftWindowInput,
  ShiftWindowState,
  WallClockParts,
} from "../types/shift-window";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function tz(value?: string): string {
  return value?.trim() || APP_TIMEZONE;
}

function parseHm(value: string): { h: number; m: number } | null {
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  return { h: Number(match[1]), m: Number(match[2]) };
}

function mins(h: number, m: number): number {
  return h * 60 + m;
}

function inWindow(now: number, start: number, end: number): boolean {
  if (start === end) {
    return true;
  }
  if (start < end) {
    return now >= start && now < end;
  }
  return now >= start || now < end;
}

function localParts(date: Date, timeZone: string): LocalDateParts {
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

function addDays(year: number, month: number, day: number, days: number) {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function evaluateShiftWindow(input: ShiftWindowInput): ShiftWindowState {
  const now = input.now ?? new Date();
  const timezone = tz(input.timezone);
  const localTime = formatTime(now, timezone);

  if (input.shift === DriverShift.FLEXIBLE) {
    return { flexible: true, canStart: true, localTime };
  }

  const start = input.startTime ? parseHm(input.startTime) : null;
  const end = input.endTime ? parseHm(input.endTime) : null;
  const nowHm = parseHm(localTime);
  if (!start || !end || !nowHm) {
    return { flexible: false, canStart: false, localTime };
  }

  return {
    flexible: false,
    canStart: inWindow(mins(nowHm.h, nowHm.m), mins(start.h, start.m), mins(end.h, end.m)),
    localTime,
  };
}

export function calculateExtraSeconds(params: CalculateExtraSecondsInput): number {
  const { shiftType, scheduledStartTime, scheduledEndTime, startedAt, endedAt } = params;
  const timezone = tz(params.timezone);

  if (shiftType === DriverShift.FLEXIBLE || !scheduledEndTime) {
    return 0;
  }

  const end = parseHm(scheduledEndTime);
  if (!end) {
    return 0;
  }

  const start = scheduledStartTime ? parseHm(scheduledStartTime) : null;
  const started = localParts(startedAt, timezone);
  const startMins = start ? mins(start.h, start.m) : null;
  const overnight = startMins !== null && startMins > mins(end.h, end.m);

  let endDay = { year: started.year, month: started.month, day: started.day };
  if (overnight && startMins !== null && started.hour * 60 + started.minute >= startMins) {
    endDay = addDays(endDay.year, endDay.month, endDay.day, 1);
  }

  const scheduledEndAt = wallToUtc(timezone, {
    year: endDay.year,
    month: endDay.month,
    day: endDay.day,
    hour: end.h,
    minute: end.m,
  });

  return Math.max(
    0,
    Math.floor(
      (endedAt.getTime() - Math.max(startedAt.getTime(), scheduledEndAt.getTime())) / 1000,
    ),
  );
}
