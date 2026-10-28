import { PLATFORM } from "@usa-limousine-corporation/config";

export const APP_TIMEZONE = PLATFORM.locale.timezone;
export const APP_LOCALE = PLATFORM.locale.locale;
export const APP_CURRENCY = PLATFORM.locale.currencySymbol;
export const APP_DISTANCE_UNIT = PLATFORM.locale.distanceUnit;

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

export { AIRPORT_KEYWORDS, HOTEL_KEYWORDS, TRAIN_KEYWORDS } from "./places";
