export type DurationParts = {
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
};

export function formatDuration(totalSeconds: number | null | undefined): DurationParts {
  const total = Math.max(0, Math.floor(totalSeconds ?? 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return {
    hours,
    minutes,
    seconds,
    label: parts.join(" "),
  };
}
