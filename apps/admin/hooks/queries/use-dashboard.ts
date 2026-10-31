import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getDashboardBookingAnalytics,
  getDriverAnalytics,
  getPlatformAnalytics,
  getUserAnalytics,
} from "../../lib/api/dashboard";
import type { AnalyticsPeriod } from "../../lib/types/dashboard";

export const dashboardKeys = {
  platform: (period: AnalyticsPeriod) =>
    ["dashboard", "platform", period.year, period.month, period.window] as const,
  bookings: (period: AnalyticsPeriod) =>
    ["dashboard", "bookings", period.year, period.month, period.window] as const,
  users: (period: AnalyticsPeriod) =>
    ["dashboard", "users", period.year, period.month, period.window] as const,
  drivers: (period: AnalyticsPeriod) =>
    ["dashboard", "drivers", period.year, period.month, period.window] as const,
};

export const usePlatformAnalytics = (period: AnalyticsPeriod) => {
  return useQuery({
    queryKey: dashboardKeys.platform(period),
    queryFn: () => getPlatformAnalytics(period),
    placeholderData: keepPreviousData,
  });
};

export const useDashboardBookingAnalytics = (period: AnalyticsPeriod) => {
  return useQuery({
    queryKey: dashboardKeys.bookings(period),
    queryFn: () => getDashboardBookingAnalytics(period),
    placeholderData: keepPreviousData,
  });
};

export const useDashboardUserAnalytics = (period: AnalyticsPeriod) => {
  return useQuery({
    queryKey: dashboardKeys.users(period),
    queryFn: () => getUserAnalytics(period),
    placeholderData: keepPreviousData,
  });
};

export const useDashboardDriverAnalytics = (period: AnalyticsPeriod) => {
  return useQuery({
    queryKey: dashboardKeys.drivers(period),
    queryFn: () => getDriverAnalytics(period),
    placeholderData: keepPreviousData,
  });
};
