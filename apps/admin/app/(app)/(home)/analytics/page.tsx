"use client";

import { useState } from "react";
import {
  BookingOverview,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/booking-overview";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { DashboardCalendarPanel } from "@/components/dashboard-calendar-panel";
import { useAuthMe } from "@/hooks/queries/use-auth";
import { useBookingAnalytics } from "@/hooks/queries/use-bookings";
import { useDashboardOverview } from "@/hooks/queries/use-dashboard";

const CURRENT_YEAR = Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4));
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const EMPTY_MONTHS = Array<number>(12).fill(0);
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Analytics = () => {
  const { data: admin } = useAuthMe();
  const greetingName = admin?.firstName?.trim() || admin?.name?.trim() || "Admin";
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState<number | null>(null);
  const { data, isLoading } = useBookingAnalytics(year, { month });
  const assignments = useDashboardOverview("monthly");
  const days = data?.monthlyRevenue.length ?? 0;
  const assignmentEmpty = (assignments.data?.labels ?? []).map(() => 0);

  const bookingStats: OverviewStat[] = [
    {
      key: "revenue",
      label: "Total Revenue",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.monthlyRevenue ?? EMPTY_MONTHS,
    },
    {
      key: "completed",
      label: "Completed Bookings",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedBookings ?? 0,
      monthly: data?.monthlyBookings.completed ?? EMPTY_MONTHS,
    },
    {
      key: "confirmed",
      label: "Confirmed Bookings",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.confirmedBookings ?? 0,
      monthly: data?.monthlyBookings.confirmed ?? EMPTY_MONTHS,
    },
    {
      key: "cancelled",
      label: "Cancelled Bookings",
      color: "destructive",
      chartColor: "#ef4444",
      kind: "count",
      total: data?.cancelledBookings ?? 0,
      monthly: data?.monthlyBookings.cancelled ?? EMPTY_MONTHS,
    },
  ];

  const assignmentStats: OverviewStat[] = [
    {
      key: "payout",
      label: "Driver Payout",
      color: "success",
      chartColor: "#22c55e",
      kind: "currency",
      total: assignments.data?.totalDriverPayout ?? 0,
      monthly: assignments.data?.assignmentSeries.driverPayout ?? assignmentEmpty,
    },
    {
      key: "rides",
      label: "Assigned Rides",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: assignments.data?.assignedRides ?? 0,
      monthly: assignments.data?.assignmentSeries.rides ?? assignmentEmpty,
    },
    {
      key: "rideTotal",
      label: "Assigned Ride Total",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: assignments.data?.assignedRideTotal ?? 0,
      monthly: assignments.data?.assignmentSeries.rideTotal ?? assignmentEmpty,
    },
    {
      key: "commission",
      label: "Admin Commission",
      color: "info",
      chartColor: "#06b6d4",
      kind: "currency",
      total: assignments.data?.totalCommission ?? 0,
      monthly: assignments.data?.assignmentSeries.commission ?? assignmentEmpty,
    },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <PageHeader
        className="mb-0"
        title={`Welcome back, ${greetingName}`}
        description="Here is an overview of your bookings, drivers and revenue performance."
      />

      <BookingOverview
        title="Booking Overview"
        description={
          month
            ? `${data?.totalBookings ?? 0} bookings in ${MONTH_NAMES[month - 1]} ${year}, by day of booking.`
            : `${data?.totalBookings ?? 0} bookings in ${year}, by month of booking.`
        }
        stats={bookingStats}
        year={year}
        years={YEARS}
        onYearChange={setYear}
        month={month}
        onMonthChange={setMonth}
        categories={
          month ? Array.from({ length: days }, (_, index) => String(index + 1)) : undefined
        }
        isLoading={isLoading}
      />

      <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <BookingOverview
            title="Driver Assignment Overview"
            description={`${assignments.data?.activeDrivers ?? 0} active drivers · assigned rides, admin commission and driver payout by pickup date.`}
            stats={assignmentStats}
            year={CURRENT_YEAR}
            categories={assignments.data?.labels ?? []}
            chartDescription="Monthly totals this year."
            isLoading={assignments.isLoading}
            statsClassName="sm:grid-cols-2 lg:grid-cols-2 lg:gap-4"
            className="h-full"
          />
        </div>
        <div className="flex min-w-0 lg:col-span-5 xl:col-span-4 hiden lg:flex">
          <DashboardCalendarPanel />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
