/** App-wide display defaults for USA Limousine Corporation. */
export const APP_TIMEZONE = "America/New_York";
export const APP_LOCALE = "en-US";
export const APP_CURRENCY = "$";
export const APP_DISTANCE_UNIT = "mile";

/** formatDate — e.g. "Oct 15, 2026" */
export const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
};

/** formatTime — e.g. "02:30 PM" */
export const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
};

export { AIRPORT_KEYWORDS, TRAIN_KEYWORDS } from "./places";
