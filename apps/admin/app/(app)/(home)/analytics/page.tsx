"use client";

import { useState } from "react";
import {
  Analytics,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/analytics";
import AreaChart from "@usa-limousine-corporation/ui/components/charts/area-chart";
import BarChart from "@usa-limousine-corporation/ui/components/charts/bar-chart";
import DonutChart from "@usa-limousine-corporation/ui/components/charts/donut-chart";
import LineChart from "@usa-limousine-corporation/ui/components/charts/line-chart";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { AnalyticsChartCard } from "@/components/analytics-chart-card";
import { AnalyticsPeriodFilters } from "@/components/analytics-period-filters";
import { usePlatformAnalytics } from "@/hooks/queries/use-dashboard";
import { defaultAnalyticsPeriod } from "@/lib/analytics-range";
import type { AnalyticsPeriod } from "@/lib/types/dashboard";

const EMPTY = Array<number>(12).fill(0);

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultAnalyticsPeriod);
  const { data, isLoading } = usePlatformAnalytics(period);
  const labels = data?.labels ?? [];

  const stats: OverviewStat[] = [
    {
      key: "revenue",
      label: "Total Revenue",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.revenueSeries ?? EMPTY,
    },
    {
      key: "bookings",
      label: "Total Bookings",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.totalBookings ?? 0,
      monthly: data?.bookingCountSeries ?? EMPTY,
    },
    {
      key: "users",
      label: "Total Users",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.totalCustomers ?? 0,
      monthly: data?.newCustomersSeries ?? EMPTY,
    },
    {
      key: "drivers",
      label: "Total Drivers",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.totalDrivers ?? 0,
      monthly: data?.assignedRidesSeries ?? EMPTY,
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

  const customerTypeSeries = [data?.normalCustomers ?? 0, data?.corporateCustomers ?? 0];
  const hasCustomers = customerTypeSeries.some((value) => value > 0);
  const completedRides = data?.completedAssignedRides ?? 0;
  const confirmedRides = Math.max(0, (data?.assignedRides ?? 0) - completedRides);
  const driverSeries = [completedRides, confirmedRides];
  const hasDrivers = driverSeries.some((value) => value > 0);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <AnalyticsPeriodFilters value={period} onChange={setPeriod} />

      <Analytics
        title="Platform Analytics"
        description={`${data?.activeDrivers ?? 0} active drivers · ${formatPrice({ price: data?.totalDriverPayout ?? 0 })} payout`}
        stats={stats}
        year={period.year}
        month={period.month}
        categories={labels}
        isLoading={isLoading}
        chartDescription="Trend for the selected filters."
        statsClassName="lg:grid-cols-3 xl:grid-cols-6"
      />

      <AnalyticsChartCard
        title="Activity report"
        description="Bookings, assigned rides and new customers"
      >
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <LineChart
            series={[
              { name: "Bookings", data: data?.bookingCountSeries ?? [] },
              { name: "Assigned rides", data: data?.assignedRidesSeries ?? [] },
              { name: "Completed rides", data: data?.completedAssignedSeries ?? [] },
              { name: "New customers", data: data?.newCustomersSeries ?? [] },
            ]}
            colors={["#06b6d4", "#C9A84C", "#22c55e", "#a855f7"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard title="Bookings vs rides" description="Stacked volume by period">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BarChart
            stacked
            series={[
              { name: "Bookings", data: data?.bookingCountSeries ?? [] },
              { name: "Assigned", data: data?.assignedRidesSeries ?? [] },
              { name: "Completed rides", data: data?.completedAssignedSeries ?? [] },
            ]}
            colors={["#8b5cf6", "#06b6d4", "#f59e0b"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AnalyticsChartCard title="Customer type" description="Normal vs corporate">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasCustomers ? (
            <DonutChart
              series={customerTypeSeries}
              labels={["Normal", "Corporate"]}
              colors={["#64748b", "#C9A84C"]}
              height={280}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-default-500">
              No customers
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Driver rides" description="Completed vs confirmed">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasDrivers ? (
            <DonutChart
              series={driverSeries}
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

      <AnalyticsChartCard title="Revenue" description="Completed booking revenue">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <AreaChart
            series={[{ name: "Revenue", data: data?.revenueSeries ?? [] }]}
            chartColor="#8b5cf6"
            height={300}
            categories={labels}
            formatYAxisValue={(value) =>
              `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
            }
            formatTooltipValue={(value) => formatPrice({ price: value })}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Commission & payout"
        description={`${formatPrice({ price: data?.totalCommission ?? 0 })} commission · ${formatPrice({ price: data?.totalDriverPayout ?? 0 })} payout`}
      >
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
    </div>
  );
}
