export type HourCycle = "12h" | "24h";

export type DateInput = string | number | Date | null | undefined;

export type DateFormatAs = "display" | "value";

export interface ToValidDateProps {
  date?: DateInput | undefined;
}

export interface FormatDateProps {
  date?: DateInput | undefined;
  options?: Intl.DateTimeFormatOptions | undefined;
  locale?: string | undefined;
  as?: DateFormatAs | undefined;
}

export interface FormatTimeProps {
  date?: DateInput | undefined;
  options?: Intl.DateTimeFormatOptions | undefined;
  locale?: string | undefined;
  as?: DateFormatAs | undefined;
  hourCycle?: HourCycle | undefined;
}

export interface FormatDateTimeProps {
  date?: DateInput | undefined;
  options?: Intl.DateTimeFormatOptions | undefined;
  locale?: string | undefined;
  as?: DateFormatAs | undefined;
  hourCycle?: HourCycle | undefined;
}

export interface FormatRelativeTimeProps {
  date?: DateInput | undefined;
}

export interface AddMinutesProps {
  date?: DateInput | undefined;
  minutes: number;
}

export interface ShiftDateTimeProps {
  date?: string | undefined;
  time?: string | undefined;
  minutes: number;
}

export interface CalculateArrivalTimeProps {
  time?: string | undefined;
  durationMinutes?: number | undefined;
  hourCycle?: HourCycle | undefined;
}

export interface ValidateBookingTimeProps {
  date?: string | undefined;
  time?: string | undefined;
  minBookingMinutes: number;
}

export interface ValidateBookingTimeResult {
  isValid: boolean;
  isPast?: boolean;
  timeDisplay?: string;
}
