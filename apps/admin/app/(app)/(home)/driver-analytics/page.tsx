"use client";

import { useState } from "react";
import {
  Analytics,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/analytics";
import BarChart from "@usa-limousine-corporation/ui/components/charts/bar-chart";
import DonutChart from "@usa-limousine-corporation/ui/components/charts/donut-chart";
import LineChart from "@usa-limousine-corporation/ui/components/charts/line-chart";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { AnalyticsChartCard } from "@/components/analytics-chart-card";
import { AnalyticsPeriodFilters } from "@/components/analytics-period-filters";
import { useDashboardDriverAnalytics } from "@/hooks/queries/use-dashboard";
import { defaultAnalyticsPeriod } from "@/lib/analytics-range";
import type { AnalyticsPeriod } from "@/lib/types/dashboard";

const EMPTY = Array<number>(12).fill(0);

export default function DriverAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultAnalyticsPeriod);
  const { data, isLoading } = useDashboardDriverAnalytics(period);
  const labels = data?.labels ?? [];

  const stats: OverviewStat[] = [
    {
      key: "assigned",
      label: "Assigned rides",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.assignedRides ?? 0,
      monthly: data?.assignedRidesSeries ?? EMPTY,
    },
    {
      key: "completed",
      label: "Completed rides",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedAssignedRides ?? 0,
      monthly: data?.completedAssignedSeries ?? EMPTY,
    },
    {
      key: "confirmed",
      label: "Confirmed rides",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.confirmedAssignedRides ?? 0,
      monthly: data?.assignedRidesSeries ?? EMPTY,
    },
    {
      key: "rideTotal",
      label: "Ride total",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.assignedRideTotal ?? 0,
      monthly: data?.rideTotalSeries ?? EMPTY,
    },
    {
      key: "commission",
      label: "Commission",
      color: "info",
      chartColor: "#8b5cf6",
      kind: "currency",
      total: data?.totalCommission ?? 0,
      monthly: data?.commissionSeries ?? EMPTY,
    },
    {
      key: "payout",
      label: "Driver payout",
      color: "success",
      chartColor: "#22c55e",
      kind: "currency",
      total: data?.totalDriverPayout ?? 0,
      monthly: data?.payoutSeries ?? EMPTY,
    },
  ];

  const rideMix = [
    data?.completedAssignedRides ?? 0,
    data?.confirmedAssignedRides ?? 0,
  ];
  const hasRides = rideMix.some((value) => value > 0);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <AnalyticsPeriodFilters value={period} onChange={setPeriod} />

      <Analytics
        title="Driver Analytics"
        description={`${data?.activeDrivers ?? 0} active / ${data?.totalDrivers ?? 0} drivers · ${formatPrice({ price: data?.totalDriverPayout ?? 0 })} payout`}
        stats={stats}
        year={period.year}
        month={period.month}
        categories={labels}
        isLoading={isLoading}
        statsClassName="lg:grid-cols-3 xl:grid-cols-6"
      />

      <AnalyticsChartCard title="Ride performance" description="Assigned vs completed rides">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <LineChart
            series={[
              { name: "Assigned", data: data?.assignedRidesSeries ?? [] },
              { name: "Completed", data: data?.completedAssignedSeries ?? [] },
            ]}
            colors={["#f59e0b", "#22c55e"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Assignment volume"
        description="Stacked assigned and completed rides"
      >
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BarChart
            stacked
            series={[
              { name: "Assigned", data: data?.assignedRidesSeries ?? [] },
              { name: "Completed", data: data?.completedAssignedSeries ?? [] },
            ]}
            colors={["#8b5cf6", "#22c55e"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard title="Commission & payout" description="Driver economics by period">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BarChart
            series={[
              { name: "Commission", data: data?.commissionSeries ?? [] },
              { name: "Payout", data: data?.payoutSeries ?? [] },
            ]}
            colors={["#8b5cf6", "#C9A84C"]}
            height={300}
            categories={labels}
            formatYAxisValue={(value) =>
              `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
            }
            formatTooltipValue={(value) => formatPrice({ price: value })}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard title="Ride mix" description="Completed vs confirmed">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : hasRides ? (
          <DonutChart
            series={rideMix}
            labels={["Completed", "Confirmed"]}
            colors={["#22c55e", "#06b6d4"]}
            height={280}
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-default-500">
            No assigned rides
          </div>
        )}
      </AnalyticsChartCard>
    </div>
  );
}
