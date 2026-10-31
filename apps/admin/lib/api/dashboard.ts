import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  AnalyticsPeriod,
  AnalyticsRange,
  BookingAnalytics,
  DriverAnalytics,
  PlatformAnalytics,
  UserAnalytics,
} from "../types/dashboard";

export type AnalyticsParams = AnalyticsPeriod & {
  range?: AnalyticsRange;
};

function toAnalyticsQuery(params?: AnalyticsParams) {
  if (!params) return undefined;
  const query: Record<string, number | string> = { year: params.year };
  if (params.month != null) query.month = params.month;
  if (params.window && params.window !== "all") {
    query.range = params.window;
  } else if (params.range) {
    query.range = params.range;
  }
  return query;
}

export const getPlatformAnalytics = (params?: AnalyticsParams) => {
  return http.get<PlatformAnalytics>(API_ROUTES.DASHBOARD, {
    params: toAnalyticsQuery(params),
  });
};

export const getDashboardBookingAnalytics = (params?: AnalyticsParams) => {
  return http.get<BookingAnalytics>(`${API_ROUTES.DASHBOARD}/bookings`, {
    params: toAnalyticsQuery(params),
  });
};

export const getUserAnalytics = (params?: AnalyticsParams) => {
  return http.get<UserAnalytics>(`${API_ROUTES.DASHBOARD}/users`, {
    params: toAnalyticsQuery(params),
  });
};

export const getDriverAnalytics = (params?: AnalyticsParams) => {
  return http.get<DriverAnalytics>(`${API_ROUTES.DASHBOARD}/drivers`, {
    params: toAnalyticsQuery(params),
  });
};
