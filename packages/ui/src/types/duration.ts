export type DurationInput = number | string | null | undefined;

export interface FormatDurationProps {
  minutes?: DurationInput;
  fallback?: string | undefined;
}
