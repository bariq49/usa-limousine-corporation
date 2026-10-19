"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@usa-limousine-corporation/ui/components/card";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import {
  dummyDashboardOverview,
  type StatKey,
  type StatCard,
  type StatCardWithTotal,
} from "@/lib/types/dashboard";
import AreaChart from "@usa-limousine-corporation/ui/charts/area-chart";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";

const statsConfig: StatCard[] = [
  {
    key: "totalRevenue",
    text: "Total Revenue",
    color: "primary",
    chartColor: "#4285F4",
    format: (value) => formatPrice({ price: value }),
  },
  {
    key: "completedBookings",
    text: "Completed Bookings",
    color: "success",
    chartColor: "#22c55e",
    format: (value) => value.toString(),
  },
  {
    key: "confirmedBookings",
    text: "Confirmed Bookings",
    color: "info",
    chartColor: "#06b6d4",
    format: (value) => value.toString(),
  },
  {
    key: "pendingBookings",
    text: "Pending Bookings",
    color: "warning",
    chartColor: "#f59e0b",
    format: (value) => value.toString(),
  },
];

const BookingOverview = () => {
  const [selectedMetric, setSelectedMetric] = useState<StatKey>("totalRevenue");
  const overview = dummyDashboardOverview;

  const stats: StatCardWithTotal[] = useMemo(() => {
    return statsConfig.map((item) => ({
      key: item.key,
      text: item.text,
      color: item.color,
      chartColor: item.chartColor,
      format: item.format,
      total: item.format(overview[item.key] ?? 0),
    }));
  }, [overview]);

  const emptyMonths = Array<number>(12).fill(0);
  const monthlyData: Record<StatKey, number[]> = {
    totalRevenue: overview.monthlyRevenue ?? emptyMonths,
    completedBookings: overview.monthlyBookings?.completed ?? emptyMonths,
    confirmedBookings: overview.monthlyBookings?.confirmed ?? emptyMonths,
    pendingBookings: overview.monthlyBookings?.pending ?? emptyMonths,
  };

  const selectedStat = stats.find((item) => item.key === selectedMetric)!;
  const year = new Date().getFullYear();

  return (
    <Card>
      <CardHeader className="border-none pb-0">
        <div className="text-xl font-semibold text-default-900 whitespace-nowrap">
          Booking Overview
        </div>
        <span className="text-xs text-default-600">
          Monthly performance and booking metrics breakdown.
        </span>
      </CardHeader>
      <CardContent className="p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((item) => (
            <button
              type="button"
              key={item.key}
              aria-pressed={selectedMetric === item.key}
              onClick={() => setSelectedMetric(item.key)}
              className={cn(
                "relative flex w-full cursor-pointer flex-col items-start gap-1.5 overflow-hidden rounded-md p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                {
                  "bg-primary/30": item.color === "primary",
                  "bg-warning/30": item.color === "warning",
                  "bg-success/30": item.color === "success",
                  "bg-info/30": item.color === "info",
                  "ring-2 ring-primary ring-offset-2": selectedMetric === item.key,
                },
              )}
            >
              <span
                className={cn("absolute -right-3 -top-3 h-10 w-10 rounded-full ring-8", {
                  "bg-primary/50 ring-primary/20": item.color === "primary",
                  "bg-amber-200 ring-amber-100": item.color === "warning",
                  "bg-green-200 ring-green-100": item.color === "success",
                  "bg-cyan-200 ring-cyan-100": item.color === "info",
                })}
              />
              <span className="relative z-10 text-sm font-semibold capitalize text-default-800">
                {item.text}
              </span>
              <span className="relative z-10 text-lg font-semibold text-default-900">
                {item.total}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 border-t border-border px-3 pt-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-default-900">
              {selectedStat.text} Overview
            </h3>
            <p className="text-xs text-default-500">
              {selectedMetric === "totalRevenue"
                ? `Monthly paid revenue in ${year}`
                : `Monthly booking count in ${year}`}
            </p>
          </div>
          <AreaChart
            series={[
              {
                name: selectedStat.text,
                data: monthlyData[selectedMetric],
              },
            ]}
            chartColor={selectedStat.chartColor}
            height={300}
            categories={[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ]}
            formatYAxisValue={
              selectedMetric === "totalRevenue"
                ? (value) => formatPrice({ price: value })
                : (value) => Math.round(value).toString()
            }
            formatTooltipValue={selectedStat.format}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingOverview;
