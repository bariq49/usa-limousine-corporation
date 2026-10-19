import type { BookingTimeData } from "./trip";

export type Slot = {
  start: Date;
  end: Date;
};

export type Point = {
  timezone: string;
  date: string | undefined;
  time: string | undefined;
  durationMs: number;
};

export type SlotInput = {
  bookingTime: BookingTimeData | null | undefined;
  duration: number;
  timezone: string;
  bufferMin?: number;
};

export type Overlaps = {
  a: Slot;
  b: Slot;
};

export type HasOverlap = {
  left: Slot[];
  right: Slot[];
};
