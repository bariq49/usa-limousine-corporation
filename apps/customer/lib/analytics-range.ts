import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { AnalyticsPeriod, AnalyticsWindow } from "./types/analytics";

export function currentAnalyticsYear() {
  return Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4));
}

export function defaultAnalyticsPeriod(): AnalyticsPeriod {
  return {
    year: currentAnalyticsYear(),
    month: null,
    window: "all",
  };
}

export const ANALYTICS_YEAR_OPTIONS = () => {
  const current = currentAnalyticsYear();
  return [current, current - 1, current - 2].map((year) => ({
    value: String(year),
    label: String(year),
  }));
};

export const ANALYTICS_MONTH_OPTIONS = [
  { value: "all", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const ANALYTICS_WINDOW_OPTIONS: { value: AnalyticsWindow; label: string }[] = [
  { value: "all", label: "Full period" },
  { value: "15d", label: "Last 15 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "24h", label: "Last 24 hours" },
  { value: "12h", label: "Last 12 hours" },
];
