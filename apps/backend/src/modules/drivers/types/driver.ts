import type { StatsPeriod } from "../../../common/utils/period-buckets";

export type DriverStats = {
  period: StatsPeriod;
  labels: string[];
  totalRides: number;
  totalEarnings: number;
  totalCommission: number;
  rides: number[];
  earnings: number[];
  commission: number[];
};
