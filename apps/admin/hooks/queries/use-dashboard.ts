import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "../../lib/api/dashboard";
import type { StatsPeriod } from "../../lib/types/drivers";

export const dashboardKeys = {
  overview: (period: StatsPeriod) => ["dashboard", "overview", period] as const,
};

export const useDashboardOverview = (period: StatsPeriod) => {
  return useQuery({
    queryKey: dashboardKeys.overview(period),
    queryFn: () => getDashboardOverview(period),
    placeholderData: keepPreviousData,
  });
};
