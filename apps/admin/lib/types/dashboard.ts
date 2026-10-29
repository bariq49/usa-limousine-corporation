import type { StatsPeriod } from "./drivers";

/** Response of GET /admin/bookings/analytics (one calendar year, Jan..Dec buckets). */
export type BookingAnalytics = {
  year: number;
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  monthlyRevenue: number[];
  monthlyBookings: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    cancelled: number[];
  };
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
