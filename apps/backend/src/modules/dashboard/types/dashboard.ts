import type { BookingStatus } from "@prisma/client";
import type { StatsPeriod } from "../../../common/utils/period-buckets";

export type BookingDayRow = {
  day: string;
  status: BookingStatus;
  count: number;
  amount: number;
};

export type AssignmentDayRow = {
  day: string;
  rides: number;
  rideTotal: number;
  commission: number;
  driverPayout: number;
};

export type DashboardOverview = {
  period: StatsPeriod;
  labels: string[];
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  revenueSeries: number[];
  bookingSeries: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    cancelled: number[];
  };
  assignedRides: number;
  assignedRideTotal: number;
  totalCommission: number;
  totalDriverPayout: number;
  assignmentSeries: {
    rides: number[];
    rideTotal: number[];
    commission: number[];
    driverPayout: number[];
  };
  activeDrivers: number;
};
