import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { DashboardOverview } from "../types/dashboard";
import type { StatsPeriod } from "../types/drivers";

export const getDashboardOverview = (period: StatsPeriod) => {
  return http.get<DashboardOverview>(API_ROUTES.DASHBOARD, { params: { period } });
};
