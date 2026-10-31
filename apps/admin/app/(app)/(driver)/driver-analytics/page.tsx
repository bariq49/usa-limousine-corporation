"use client";

import {
  Analytics,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/analytics";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { useDashboardOverview } from "@/hooks/queries/use-dashboard";

const CURRENT_YEAR = Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4));

export default function DriverAnalyticsPage() {
  const assignments = useDashboardOverview("monthly");
  const assignmentEmpty = (assignments.data?.labels ?? []).map(() => 0);

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
        title="Driver Analytics"
        description="Assigned rides, admin commission and driver payout by pickup date."
      />

      <Analytics
        title="Driver Analytics"
        description={`${assignments.data?.activeDrivers ?? 0} active drivers · assigned rides, admin commission and driver payout by pickup date.`}
        stats={assignmentStats}
        year={CURRENT_YEAR}
        categories={assignments.data?.labels ?? []}
        chartDescription="Monthly totals this year."
        isLoading={assignments.isLoading}
      />
    </div>
  );
}
