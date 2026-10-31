"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Analytics,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/analytics";
import AreaChart from "@usa-limousine-corporation/ui/components/charts/area-chart";
import BarChart from "@usa-limousine-corporation/ui/components/charts/bar-chart";
import DonutChart from "@usa-limousine-corporation/ui/components/charts/donut-chart";
import LineChart from "@usa-limousine-corporation/ui/components/charts/line-chart";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { useUser } from "@usa-limousine-corporation/ui/providers/user-context";
import { Calendar, CalendarClock, Plus, User } from "@usa-limousine-corporation/ui/svg";
import { formatDate, formatTime } from "@usa-limousine-corporation/ui/utils/date";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { AnalyticsChartCard } from "@/components/analytics-chart-card";
import { AnalyticsPeriodFilters } from "@/components/analytics-period-filters";
import { HelpCenterCard } from "@/components/help-center/help-center-card";
import { useBookingAnalytics } from "@/hooks/queries/use-bookings";
import { defaultAnalyticsPeriod } from "@/lib/analytics-range";
import type { AnalyticsPeriod } from "@/lib/types/analytics";

const EMPTY = Array<number>(12).fill(0);

export default function DashboardPage() {
  const { user } = useUser();
  const name = user?.firstName?.trim() || user?.name?.trim() || "there";
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultAnalyticsPeriod);
  const [now, setNow] = useState(() => new Date());
  const { data, isLoading } = useBookingAnalytics(period);
  const series = data?.monthlyBookings;
  const labels = data?.labels ?? [];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stats: OverviewStat[] = [
    {
      key: "spent",
      label: "Total Spent",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.monthlyRevenue ?? EMPTY,
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
      key: "completed",
      label: "Completed rides",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedBookings ?? 0,
      monthly: series?.completed ?? EMPTY,
    },
    {
      key: "upcoming",
      label: "Scheduled",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.confirmedBookings ?? 0,
      monthly: series?.confirmed ?? EMPTY,
    },
    {
      key: "pending",
      label: "Pending",
      color: "warning",
      chartColor: "#f59e0b",
      kind: "count",
      total: data?.pendingBookings ?? 0,
      monthly: series?.pending ?? EMPTY,
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
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-default-900">
            Welcome back, {name}
          </h1>
          <p className="text-sm text-default-500">An overview of your bookings and spending.</p>
          <p className="pt-1 text-xs text-default-500 lg:hidden">
            {formatDate({
              date: now,
              options: {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              },
            })}{" "}
            · {formatTime({ date: now })}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 lg:items-end">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-medium text-default-900">
              {formatDate({
                date: now,
                options: {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                },
              })}
            </p>
            <p className="text-xs text-default-500">{formatTime({ date: now })}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:hidden">
            <Button asChild size="sm" className="h-9 gap-1.5">
              <a href={`${process.env["NEXT_PUBLIC_WEBSITE_URL"]}/book-ride`}>
                <Plus className="h-4 w-4 shrink-0" />
                Book a ride
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              color="secondary"
              className="h-9 gap-1.5"
            >
              <Link href="/scheduled-bookings">
                <CalendarClock className="h-4 w-4 shrink-0" />
                Scheduled
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              color="secondary"
              className="h-9 gap-1.5"
            >
              <Link href="/bookings">
                <Calendar className="h-4 w-4 shrink-0" />
                All bookings
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              color="secondary"
              className="h-9 gap-1.5"
            >
              <Link href="/profile-setting">
                <User className="h-4 w-4 shrink-0" />
                Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-0.5">
          <div className="text-sm font-semibold text-default-900">Analytics period</div>
          <p className="text-xs text-default-500">
            Choose year, month, or a short range for your booking stats.
          </p>
        </div>
        <AnalyticsPeriodFilters value={period} onChange={setPeriod} />
      </div>

      <Analytics
        title="My Bookings"
        description={`${data?.totalBookings ?? 0} bookings · ${formatPrice({ price: data?.totalRevenue ?? 0 })} spent`}
        stats={stats}
        year={period.year}
        month={period.month}
        categories={labels}
        isLoading={isLoading}
        chartDescription="Trend for the selected filters."
        statsClassName="lg:grid-cols-4 xl:grid-cols-4"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnalyticsChartCard title="Status mix" description="Share of your bookings">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : hasStatus ? (
            <DonutChart
              series={statusSeries}
              labels={["Completed", "Confirmed", "Pending", "Cancelled"]}
              colors={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"]}
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

      <AnalyticsChartCard title="Spending" description="Completed booking spend over time">
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <AreaChart
            series={[{ name: "Spent", data: data?.monthlyRevenue ?? [] }]}
            chartColor="#C9A84C"
            height={300}
            categories={labels}
            formatYAxisValue={(value) =>
              `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
            }
            formatTooltipValue={(value) => formatPrice({ price: value })}
          />
        )}
      </AnalyticsChartCard>

      <HelpCenterCard />
    </div>
  );
}
