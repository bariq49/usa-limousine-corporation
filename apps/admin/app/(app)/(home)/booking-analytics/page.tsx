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
import { useDashboardBookingAnalytics } from "@/hooks/queries/use-dashboard";
import { defaultAnalyticsPeriod } from "@/lib/analytics-range";
import type { AnalyticsPeriod } from "@/lib/types/dashboard";

const EMPTY = Array<number>(12).fill(0);

export default function BookingAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultAnalyticsPeriod);
  const { data, isLoading } = useDashboardBookingAnalytics(period);
  const series = data?.series;
  const labels = data?.labels ?? [];

  const stats: OverviewStat[] = [
    {
      key: "revenue",
      label: "Completed revenue",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.revenueSeries ?? EMPTY,
    },
    {
      key: "completedAmount",
      label: "Completed amount",
      color: "success",
      chartColor: "#22c55e",
      kind: "currency",
      total: data?.completedAmount ?? 0,
      monthly: data?.amountSeries?.completed ?? EMPTY,
    },
    {
      key: "confirmedAmount",
      label: "Confirmed amount",
      color: "info",
      chartColor: "#06b6d4",
      kind: "currency",
      total: data?.confirmedAmount ?? 0,
      monthly: data?.amountSeries?.confirmed ?? EMPTY,
    },
    {
      key: "pendingAmount",
      label: "Pending amount",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "currency",
      total: data?.pendingAmount ?? 0,
      monthly: data?.amountSeries?.pending ?? EMPTY,
    },
    {
      key: "cancelledAmount",
      label: "Cancelled amount",
      color: "destructive",
      chartColor: "#ef4444",
      kind: "currency",
      total: data?.cancelledAmount ?? 0,
      monthly: data?.amountSeries?.cancelled ?? EMPTY,
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
      key: "bookings",
      label: "Total Bookings",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.totalBookings ?? 0,
      monthly: (series?.completed ?? EMPTY).map(
        (value, index) =>
          value +
          (series?.confirmed[index] ?? 0) +
          (series?.pending[index] ?? 0) +
          (series?.cancelled[index] ?? 0),
      ),
    },
    {
      key: "completed",
      label: "Completed",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedBookings ?? 0,
      monthly: series?.completed ?? EMPTY,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.confirmedBookings ?? 0,
      monthly: series?.confirmed ?? EMPTY,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      color: "destructive",
      chartColor: "#ef4444",
      kind: "count",
      total: data?.cancelledBookings ?? 0,
      monthly: series?.cancelled ?? EMPTY,
    },
  ];

  const statusSeries = [
    data?.completedBookings ?? 0,
    data?.confirmedBookings ?? 0,
    data?.pendingBookings ?? 0,
    data?.unpaidBookings ?? 0,
    data?.cancelledBookings ?? 0,
  ];
  const hasStatus = statusSeries.some((value) => value > 0);
  const amountMix = [
    data?.completedAmount ?? 0,
    data?.confirmedAmount ?? 0,
    data?.pendingAmount ?? 0,
    data?.cancelledAmount ?? 0,
  ];
  const hasAmounts = amountMix.some((value) => value > 0);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <AnalyticsPeriodFilters value={period} onChange={setPeriod} />

      <Analytics
        title="Booking Analytics"
        description={`AOV ${data ? formatPrice({ price: data.averageOrderValue }) : "—"} · ${data?.totalBookings ?? 0} bookings`}
        stats={stats}
        year={period.year}
        month={period.month}
        categories={labels}
        isLoading={isLoading}
        statsClassName="lg:grid-cols-3 xl:grid-cols-5"
      />

      <AnalyticsChartCard
        title="Booking status trend"
        description="Completed, confirmed, pending and cancelled over time"
      >
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <LineChart
            series={[
              { name: "Completed", data: series?.completed ?? [] },
              { name: "Confirmed", data: series?.confirmed ?? [] },
              { name: "Pending", data: series?.pending ?? [] },
              { name: "Cancelled", data: series?.cancelled ?? [] },
            ]}
            colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard title="Booking volume" description="Stacked status counts by period">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BarChart
            stacked
            series={[
              { name: "Completed", data: series?.completed ?? [] },
              { name: "Confirmed", data: series?.confirmed ?? [] },
              { name: "Pending", data: series?.pending ?? [] },
              { name: "Cancelled", data: series?.cancelled ?? [] },
            ]}
            colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"]}
            height={300}
            categories={labels}
          />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Booking amounts"
        description="Money by booking status over time"
      >
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <BarChart
            stacked
            series={[
              { name: "Completed", data: data?.amountSeries?.completed ?? [] },
              { name: "Confirmed", data: data?.amountSeries?.confirmed ?? [] },
              { name: "Pending", data: data?.amountSeries?.pending ?? [] },
              { name: "Cancelled", data: data?.amountSeries?.cancelled ?? [] },
            ]}
            colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"]}
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
        <AnalyticsChartCard title="Status mix" description="Share of bookings">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasStatus ? (
            <DonutChart
              series={statusSeries}
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

        <AnalyticsChartCard title="Amount mix" description="Totals by status">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasAmounts ? (
            <DonutChart
              series={amountMix}
              labels={["Completed", "Confirmed", "Pending", "Cancelled"]}
              colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"]}
              height={280}
              formatTooltipValue={(value) => formatPrice({ price: value })}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-default-500">
              No amounts
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Revenue"
        description={`AOV ${data ? formatPrice({ price: data.averageOrderValue }) : "—"}`}
      >
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
