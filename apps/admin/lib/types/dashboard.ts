export type AnalyticsRange = "12h" | "24h" | "7d" | "15d" | "30d" | "month" | "year";

export type AnalyticsWindow = "all" | "12h" | "24h" | "7d" | "15d";

export type AnalyticsPeriod = {
  year: number;
  month: number | null;
  window: AnalyticsWindow;
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

export type LegacyBookingAnalytics = {
  year: number;
  month?: number | null;
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
