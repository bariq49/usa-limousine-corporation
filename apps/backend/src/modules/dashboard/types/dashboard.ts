import type { BookingStatus, CustomerType } from "@prisma/client";
import type { AnalyticsRange } from "../../../common/utils/analytics-range";
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

export type BookingEventRow = {
  createdAt: Date;
  status: BookingStatus;
  amount: number;
  unpaid: boolean;
  bookingCompleted: boolean;
};

export type AssignmentEventRow = {
  pickupAt: Date;
  rides: number;
  rideTotal: number;
  commission: number;
  driverPayout: number;
  completed: boolean;
};

export type CustomerEventRow = {
  createdAt: Date;
  type: CustomerType;
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

export type StatusCounts = {
  completed: number;
  confirmed: number;
  pending: number;
  unpaid: number;
  cancelled: number;
};

export type StatusAmounts = {
  completed: number;
  confirmed: number;
  pending: number;
  unpaid: number;
  cancelled: number;
};

export type PlatformAnalytics = {
  year: number;
  month: number | null;
  range: AnalyticsRange | null;
  labels: string[];
  totalBookings: number;
  totalRevenue: number;
  completedAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  unpaidAmount: number;
  cancelledAmount: number;
  totalCustomers: number;
  normalCustomers: number;
  corporateCustomers: number;
  activeDrivers: number;
  totalDrivers: number;
  totalCommission: number;
  totalDriverPayout: number;
  assignedRides: number;
  completedAssignedRides: number;
  confirmedBookings: number;
  completedBookings: number;
  pendingBookings: number;
  unpaidBookings: number;
  cancelledBookings: number;
  newCustomers: number;
  revenueSeries: number[];
  bookingCountSeries: number[];
  newCustomersSeries: number[];
  assignedRidesSeries: number[];
  completedAssignedSeries: number[];
  commissionSeries: number[];
  payoutSeries: number[];
  amountSeries: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    cancelled: number[];
  };
  statusBreakdown: StatusCounts;
  statusAmounts: StatusAmounts;
};

export type BookingAnalytics = {
  year: number;
  month: number | null;
  range: AnalyticsRange | null;
  labels: string[];
  totalBookings: number;
  totalRevenue: number;
  completedAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  unpaidAmount: number;
  cancelledAmount: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  unpaidBookings: number;
  cancelledBookings: number;
  averageOrderValue: number;
  totalCommission: number;
  totalDriverPayout: number;
  revenueSeries: number[];
  commissionSeries: number[];
  payoutSeries: number[];
  amountSeries: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    cancelled: number[];
  };
  series: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    unpaid: number[];
    cancelled: number[];
  };
};

export type UserAnalytics = {
  year: number;
  month: number | null;
  range: AnalyticsRange | null;
  labels: string[];
  totalCustomers: number;
  normalCustomers: number;
  corporateCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  totalSpent: number;
  totalBookings: number;
  completedBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  unpaidBookings: number;
  cancelledBookings: number;
  newCustomersSeries: number[];
  spentSeries: number[];
  bookingSeries: {
    completed: number[];
    confirmed: number[];
    pending: number[];
    cancelled: number[];
  };
};

export type DriverAnalytics = {
  year: number;
  month: number | null;
  range: AnalyticsRange | null;
  labels: string[];
  activeDrivers: number;
  totalDrivers: number;
  assignedRides: number;
  completedAssignedRides: number;
  confirmedAssignedRides: number;
  assignedRideTotal: number;
  totalCommission: number;
  totalDriverPayout: number;
  assignedRidesSeries: number[];
  completedAssignedSeries: number[];
  rideTotalSeries: number[];
  commissionSeries: number[];
  payoutSeries: number[];
};
