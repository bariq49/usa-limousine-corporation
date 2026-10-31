import type { StatsPeriod } from "../../../common/utils/period-buckets";
import type { DriverAssignedMailProps } from "../../../infrastructure/email/types/booking";

export type DriverAssignmentEmail = Omit<DriverAssignedMailProps, "siteUrl"> & {
  to: string;
};

export type DriverAssignmentSms = {
  to: string;
  bookingNumber: string;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
};

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
