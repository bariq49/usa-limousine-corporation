"use client";

import { APP_TIMEZONE } from "@usa-limousine-corporation/ui/constants";
import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import {
  BookingOverview,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/dashboard/booking-overview";
import { DashboardCalendarPanel } from "@/components/dashboard-calendar-panel";
import { PeriodSelect } from "@/components/period-select";
import { STATS_PERIODS } from "@/config/periods";
import { useAuthMe } from "@/hooks/queries/use-auth";
import { useDashboardOverview } from "@/hooks/queries/use-dashboard";
import type { StatsPeriod } from "@/lib/types/drivers";

const Analytics = () => {
  const { data: admin } = useAuthMe();
  const greetingName = admin?.firstName?.trim() || admin?.name?.trim() || "Admin";
  const [period, setPeriod] = useState<StatsPeriod>("monthly");
  const { data, isLoading, isFetching } = useDashboardOverview(period);
  const empty = (data?.labels ?? []).map(() => 0);
  const subtitle = `${STATS_PERIODS.find((item) => item.value === period)?.description ?? ""}${
    isFetching && !isLoading ? " · Updating..." : ""
  }`;

  const bookingStats: OverviewStat[] = [
    {
      key: "revenue",
      label: "Total Revenue",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.revenueSeries ?? empty,
    },
    {
      key: "completed",
      label: "Completed Bookings",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedBookings ?? 0,
      monthly: data?.bookingSeries.completed ?? empty,
    },
    {
      key: "confirmed",
      label: "Confirmed Bookings",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.confirmedBookings ?? 0,
      monthly: data?.bookingSeries.confirmed ?? empty,
    },
    {
      key: "pending",
      label: "Pending Bookings",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.pendingBookings ?? 0,
      monthly: data?.bookingSeries.pending ?? empty,
    },
    {
      key: "cancelled",
      label: "Cancelled Bookings",
      color: "destructive",
      chartColor: "#ef4444",
      kind: "count",
      total: data?.cancelledBookings ?? 0,
      monthly: data?.bookingSeries.cancelled ?? empty,
    },
  ];

  const assignmentStats: OverviewStat[] = [
    {
      key: "payout",
      label: "Driver Payout",
      color: "success",
      chartColor: "#22c55e",
      kind: "currency",
      total: data?.totalDriverPayout ?? 0,
      monthly: data?.assignmentSeries.driverPayout ?? empty,
    },
    {
      key: "rides",
      label: "Assigned Rides",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.assignedRides ?? 0,
      monthly: data?.assignmentSeries.rides ?? empty,
    },
    {
      key: "rideTotal",
      label: "Assigned Ride Total",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.assignedRideTotal ?? 0,
      monthly: data?.assignmentSeries.rideTotal ?? empty,
    },
    {
      key: "commission",
      label: "Admin Commission",
      color: "info",
      chartColor: "#06b6d4",
      kind: "currency",
      total: data?.totalCommission ?? 0,
      monthly: data?.assignmentSeries.commission ?? empty,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-default-800">Welcome back, {greetingName}</h1>
        <p className="mt-1 text-sm text-default-500">
          Here is an overview of your bookings, drivers and revenue performance.
        </p>
      </div>

      <BookingOverview
        title="Booking Overview"
        description={`${data?.totalBookings ?? 0} bookings by booking date · performance and booking metrics breakdown.`}
        stats={bookingStats}
        year={Number(formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy"))}
        categories={data?.labels ?? []}
        chartDescription={subtitle}
        isLoading={isLoading}
        actions={<PeriodSelect value={period} onChange={setPeriod} />}
      />

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <BookingOverview
            title="Driver Assignment Overview"
            description={`${data?.activeDrivers ?? 0} active drivers · assigned rides, admin commission and driver payout by pickup date.`}
            stats={assignmentStats}
            year={Number(formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy"))}
            categories={data?.labels ?? []}
            chartDescription={subtitle}
            isLoading={isLoading}
            statsClassName="sm:grid-cols-2 lg:grid-cols-2 lg:gap-4"
          />
        </div>
        <div className="min-w-0 lg:col-span-5 xl:col-span-4">
          <DashboardCalendarPanel />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
