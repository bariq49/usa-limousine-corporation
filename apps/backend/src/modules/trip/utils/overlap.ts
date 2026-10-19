import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import type { HasOverlap, Overlaps, Point, Slot, SlotInput } from "../types/overlap";

function slot({ timezone, date, time, durationMs }: Point): Slot | null {
  if (!date || !time) {
    return null;
  }
  const start = wallClock(timezone, date, time);
  if (!start) {
    return null;
  }
  return { start, end: new Date(start.getTime() + durationMs) };
}

export function slots({ bookingTime, duration, timezone, bufferMin = 0 }: SlotInput): Slot[] {
  const zone = timezone || APP_TIMEZONE;
  const durationMs = (Math.max(0, duration) + Math.max(0, bufferMin)) * 60 * 1000;
  const result: Slot[] = [];
  const pickup = slot({
    timezone: zone,
    date: bookingTime?.pickupDate,
    time: bookingTime?.pickupTime,
    durationMs,
  });
  if (pickup) {
    result.push(pickup);
  }
  const ret = slot({
    timezone: zone,
    date: bookingTime?.returnDate,
    time: bookingTime?.returnTime,
    durationMs,
  });
  if (ret) {
    result.push(ret);
  }
  return result;
}

export function overlaps({ a, b }: Overlaps): boolean {
  if (a.start.getTime() === b.start.getTime()) {
    return true;
  }
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

export function hasOverlap({ left, right }: HasOverlap): boolean {
  for (const a of left) {
    for (const b of right) {
      if (overlaps({ a, b })) {
        return true;
      }
    }
  }
  return false;
}
