export type DistanceInput = number | string | null | undefined;

export interface FormatDistanceProps {
  distance?: DistanceInput;
  unit?: string | undefined;
  fallback?: string | undefined;
  digits?: number | undefined;
}
