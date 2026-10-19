import type { DriverShift } from "@prisma/client";

export type ShiftWindowInput = {
  shift: DriverShift;
  startTime: string | null | undefined;
  endTime: string | null | undefined;
  timezone?: string;
  now?: Date;
};

export type ShiftWindowState = {
  flexible: boolean;
  canStart: boolean;
  localTime: string;
};

export type CalculateExtraSecondsInput = {
  shiftType: DriverShift;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  timezone?: string;
  startedAt: Date;
  endedAt: Date;
};

export type WallClockParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
};

export type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};
