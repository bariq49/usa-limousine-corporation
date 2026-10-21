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
