export type DateInput = string | number | Date | null | undefined;

export interface ToValidDateProps {
  date?: DateInput | undefined;
}

export interface FormatDateProps {
  date?: DateInput | undefined;
  options?: Intl.DateTimeFormatOptions | undefined;
  locale?: string | undefined;
}

export interface FormatTimeProps {
  date?: DateInput | undefined;
  options?: Intl.DateTimeFormatOptions | undefined;
  locale?: string | undefined;
}

export interface FormatDateTimeProps {
  date?: DateInput | undefined;
  options?: Intl.DateTimeFormatOptions | undefined;
  locale?: string | undefined;
}

export interface FormatRelativeTimeProps {
  date?: DateInput | undefined;
}
