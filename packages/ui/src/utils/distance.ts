import { APP_DISTANCE_UNIT } from "../constants/index";
import type { FormatDistanceProps } from "../types/distance";

export type { FormatDistanceProps };

export function formatDistance(props?: FormatDistanceProps): string {
  const { distance, unit = APP_DISTANCE_UNIT, fallback = "—", digits = 1 } = props ?? {};

  if (distance === null || distance === undefined || distance === "") {
    return fallback;
  }

  const value = typeof distance === "number" ? distance : Number(distance);
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const safe = Math.max(0, value);
  const formatted = Number.isInteger(safe) && digits === 0 ? String(safe) : safe.toFixed(digits);

  return `${formatted} ${unit}`;
}
