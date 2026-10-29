"use client";

import { APP_TIMEZONE } from "@usa-limousine-corporation/ui/constants";
import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import {
  BookingOverview,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/dashboard/booking-overview";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { useUser } from "@usa-limousine-corporation/ui/providers/user-context";
import { BookingCalendar } from "@usa-limousine-corporation/ui/bookings/booking-calendar";
import type { CalendarQuery } from "@usa-limousine-corporation/ui/bookings/types";
import { useBookingAnalytics, useBookingCalendar } from "@/hooks/queries/use-bookings";

const CURRENT_YEAR = Number(formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy"));
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const EMPTY_MONTHS = Array<number>(12).fill(0);

export default function DashboardPage() {
  const { user } = useUser();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [calendarQuery, setCalendarQuery] = useState<CalendarQuery | null>(null);
  const calendar = useBookingCalendar(calendarQuery);
  const { data, isLoading } = useBookingAnalytics(year);
  const name = user?.firstName?.trim() || user?.name?.trim() || "there";

  const stats: OverviewStat[] = [
    {
      key: "spent",
      label: "Total Spent",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.monthlyRevenue ?? EMPTY_MONTHS,
    },
    {
      key: "completed",
      label: "Completed Rides",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedBookings ?? 0,
      monthly: data?.monthlyBookings.completed ?? EMPTY_MONTHS,
    },
    {
      key: "upcoming",
      label: "Upcoming Rides",
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
      label: "Cancelled",
      color: "destructive",
      chartColor: "#ef4444",
      kind: "count",
      total: data?.cancelledBookings ?? 0,
      monthly: data?.monthlyBookings.cancelled ?? EMPTY_MONTHS,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${name}`}
        description="An overview of your bookings and spending."
        breadcrumbs={[{ label: "Customer" }, { label: "Dashboard" }]}
      />
      <BookingOverview
        title="My Bookings"
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
}
