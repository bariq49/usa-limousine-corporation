export type AnalyticsRange = "12h" | "24h" | "7d" | "15d" | "30d" | "month" | "year";

export type AnalyticsWindow = "all" | "12h" | "24h" | "7d" | "15d";

export type AnalyticsPeriod = {
  year: number;
  month: number | null;
  window: AnalyticsWindow;
};
