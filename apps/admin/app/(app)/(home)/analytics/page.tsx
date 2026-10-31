"use client";

import { useState } from "react";
import {
  Analytics,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/analytics";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { useAuthMe } from "@/hooks/queries/use-auth";
import { useBookingAnalytics } from "@/hooks/queries/use-bookings";

const CURRENT_YEAR = Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4));
const EMPTY_MONTHS = Array<number>(12).fill(0);
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AnalyticsPage() {
  const { data: admin } = useAuthMe();
  const greetingName = admin?.firstName?.trim() || admin?.name?.trim() || "Admin";
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState<number | null>(null);
  const { data, isLoading } = useBookingAnalytics(year, { month });
  const days = data?.monthlyRevenue.length ?? 0;

  const bookingStats: OverviewStat[] = [
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
    <div className="flex w-full min-w-0 flex-col gap-8">
      <PageHeader
        className="mb-0"
        title={`Welcome back, ${greetingName}`}
        description="Here is an overview of your bookings and revenue performance."
      />

      <Analytics
        title="Booking Analytics"
        description={
          month
            ? `${data?.totalBookings ?? 0} bookings in ${MONTH_NAMES[month - 1]} ${year}, by day of booking.`
            : `${data?.totalBookings ?? 0} bookings in ${year}, by month of booking.`
        }
        stats={bookingStats}
        year={year}
        month={month}
        onFiltersChange={(filters) => {
          setYear(filters.year);
          setMonth(filters.month);
        }}
        categories={
          month ? Array.from({ length: days }, (_, index) => String(index + 1)) : undefined
        }
        isLoading={isLoading}
      />
    </div>
  );
}
