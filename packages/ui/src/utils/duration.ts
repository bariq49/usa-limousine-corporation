import type { FormatDurationProps, FormatHrsProps } from "../types/duration";

export function formatDuration(props?: FormatDurationProps): string {
  const { minutes, fallback = "—" } = props ?? {};

  if (minutes === null || minutes === undefined || minutes === "") {
    return fallback;
  }

  const value = typeof minutes === "number" ? minutes : Number(minutes);
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const total = Math.max(0, Math.round(value));
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours <= 0) return `${mins} min`;
  if (mins <= 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function formatHrs(props: FormatHrsProps): string {
  const { hours } = props;
  return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
}
