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
import { useDashboardUserAnalytics } from "@/hooks/queries/use-dashboard";
import { defaultAnalyticsPeriod } from "@/lib/analytics-range";
import type { AnalyticsPeriod } from "@/lib/types/dashboard";

const EMPTY = Array<number>(12).fill(0);

export default function UserAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultAnalyticsPeriod);
  const { data, isLoading } = useDashboardUserAnalytics(period);
  const labels = data?.labels ?? [];

  const stats: OverviewStat[] = [
    {
      key: "spent",
      label: "Total Spent",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalSpent ?? 0,
      monthly: data?.spentSeries ?? EMPTY,
    },
    {
      key: "users",
      label: "Total Users",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.totalCustomers ?? 0,
      monthly: data?.newCustomersSeries ?? EMPTY,
    },
    {
      key: "new",
      label: "New customers",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.newCustomers ?? 0,
      monthly: data?.newCustomersSeries ?? EMPTY,
    },
    {
      key: "active",
      label: "Active",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.activeCustomers ?? 0,
      monthly: data?.bookingSeries.completed ?? EMPTY,
    },
    {
      key: "normal",
      label: "Normal",
      color: "warning",
      chartColor: "#64748b",
      kind: "count",
      total: data?.normalCustomers ?? 0,
      monthly: data?.newCustomersSeries ?? EMPTY,
    },
    {
      key: "corporate",
      label: "Corporate",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "count",
      total: data?.corporateCustomers ?? 0,
      monthly: data?.newCustomersSeries ?? EMPTY,
    },
  ];

  const typeSeries = [data?.normalCustomers ?? 0, data?.corporateCustomers ?? 0];
  const hasTypes = typeSeries.some((value) => value > 0);
  const bookingStatusSeries = [
    data?.completedBookings ?? 0,
    data?.confirmedBookings ?? 0,
    data?.pendingBookings ?? 0,
    data?.unpaidBookings ?? 0,
    data?.cancelledBookings ?? 0,
  ];
  const hasBookings = bookingStatusSeries.some((value) => value > 0);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <AnalyticsPeriodFilters value={period} onChange={setPeriod} />

      <Analytics
        title="User Analytics"
        description={`${data?.totalCustomers ?? 0} customers · ${formatPrice({ price: data?.totalSpent ?? 0 })} spent`}
        stats={stats}
        year={period.year}
        month={period.month}
        categories={labels}
        isLoading={isLoading}
        statsClassName="lg:grid-cols-3 xl:grid-cols-6"
      />

      <AnalyticsChartCard title="Customer growth" description="New customers and spend">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <LineChart
            series={[
              { name: "New customers", data: data?.newCustomersSeries ?? [] },
              { name: "Completed bookings", data: data?.bookingSeries.completed ?? [] },
              { name: "Confirmed bookings", data: data?.bookingSeries.confirmed ?? [] },
            ]}
            colors={["#22c55e", "#06b6d4", "#8b5cf6"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard title="Customer spend" description="Completed booking spend">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <AreaChart
            series={[{ name: "Spent", data: data?.spentSeries ?? [] }]}
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AnalyticsChartCard title="Customer type" description="Normal vs corporate">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasTypes ? (
            <DonutChart
              series={typeSeries}
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

        <AnalyticsChartCard title="Booking status" description="Bookings by customers">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasBookings ? (
            <DonutChart
              series={bookingStatusSeries}
              labels={["Completed", "Confirmed", "Pending", "Unpaid", "Cancelled"]}
              colors={["#22c55e", "#06b6d4", "#f59e0b", "#a855f7", "#ef4444"]}
              height={280}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-default-500">
              No bookings
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Booking activity"
        description="Stacked booking status by period"
      >
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BarChart
            stacked
            series={[
              { name: "Completed", data: data?.bookingSeries.completed ?? [] },
              { name: "Confirmed", data: data?.bookingSeries.confirmed ?? [] },
              { name: "Pending", data: data?.bookingSeries.pending ?? [] },
              { name: "Cancelled", data: data?.bookingSeries.cancelled ?? [] },
            ]}
            colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>
    </div>
  );
}
