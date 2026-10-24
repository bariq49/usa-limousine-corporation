"use client";

import { useState } from "react";
import {
  BookingOverview,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/dashboard/booking-overview";
import { useAuthMe } from "@/hooks/queries/use-auth";
import { BookingCalendar } from "@usa-limousine-corporation/ui/bookings/booking-calendar";
import type { CalendarQuery } from "@usa-limousine-corporation/ui/bookings/types";
import { useBookingAnalytics, useBookingCalendar } from "@/hooks/queries/use-bookings";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];
const EMPTY_MONTHS = Array<number>(12).fill(0);

const Analytics = () => {
  const { data: admin } = useAuthMe();
  const greetingName = admin?.firstName?.trim() || admin?.name?.trim() || "Admin";
  const [year, setYear] = useState(CURRENT_YEAR);
  const [calendarQuery, setCalendarQuery] = useState<CalendarQuery | null>(null);
  const calendar = useBookingCalendar(calendarQuery);
  const { data, isLoading } = useBookingAnalytics(year);

  const stats: OverviewStat[] = [
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
      key: "pending",
      label: "Pending Bookings",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.pendingBookings ?? 0,
      monthly: data?.monthlyBookings.pending ?? EMPTY_MONTHS,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-default-800">Welcome back, {greetingName}</h1>
          <p className="mt-1 text-sm text-default-500">
            Here is an overview of your bookings and revenue performance.
          </p>
        </div>
      </div>

      <BookingOverview
        title="Booking Overview"
        description={`${data?.totalBookings ?? 0} bookings in ${year}, by month of booking.`}
        stats={stats}
        year={year}
        years={YEARS}
        onYearChange={setYear}
        isLoading={isLoading}
      />

      <BookingCalendar
        events={calendar.data}
        isFetching={calendar.isFetching}
        onQueryChange={setCalendarQuery}
        basePath="/bookings"
      />
    </div>
  );
};

export default Analytics;
