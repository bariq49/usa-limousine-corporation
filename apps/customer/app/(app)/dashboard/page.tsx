"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookingOverview,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/booking-overview";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { useUser } from "@usa-limousine-corporation/ui/providers/user-context";
import { Calendar, CalendarClock, Plus, User } from "@usa-limousine-corporation/ui/svg";
import { formatDate, formatTime } from "@usa-limousine-corporation/ui/utils/date";
import { HelpCenterCard } from "@/components/help-center/help-center-card";
import { useBookingAnalytics } from "@/hooks/queries/use-bookings";

const CURRENT_YEAR = Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4));
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
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

export default function DashboardPage() {
  const { user } = useUser();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const { data, isLoading } = useBookingAnalytics(year, month);
  const days = data?.monthlyRevenue.length ?? 0;
  const name = user?.firstName?.trim() || user?.name?.trim() || "there";

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
    <div className="flex flex-col gap-8">
      <PageHeader
        className="mb-0"
        title={`Welcome back, ${name}`}
        description="An overview of your bookings and spending."
        actions={
          <div className="hidden w-full text-right sm:block">
            <p className="text-sm font-semibold text-default-900">
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
        }
      />
      <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
        <Button asChild size="sm" className="h-10 w-full gap-1.5">
          <a href={`${process.env["NEXT_PUBLIC_WEBSITE_URL"]}/book-ride`}>
            <Plus className="h-4 w-4 shrink-0" />
            Book a ride
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" color="secondary" className="h-10 w-full gap-1.5">
          <Link href="/calendar">
            <CalendarClock className="h-4 w-4 shrink-0" />
            Upcoming rides
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" color="secondary" className="h-10 w-full gap-1.5">
          <Link href="/bookings">
            <Calendar className="h-4 w-4 shrink-0" />
            All bookings
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" color="secondary" className="h-10 w-full gap-1.5">
          <Link href="/profile-setting">
            <User className="h-4 w-4 shrink-0" />
            Profile
          </Link>
        </Button>
      </div>
      <BookingOverview
        title="My Bookings"
        description={
          month
            ? `${data?.totalBookings ?? 0} bookings in ${MONTH_NAMES[month - 1]} ${year}, by day of booking.`
            : `${data?.totalBookings ?? 0} bookings in ${year}, by month of booking.`
        }
        stats={stats}
        year={year}
        years={YEARS}
        onYearChange={setYear}
        month={month}
        onMonthChange={setMonth}
        categories={
          month ? Array.from({ length: days }, (_, index) => String(index + 1)) : undefined
        }
        isLoading={isLoading}
      />
      <HelpCenterCard />
    </div>
  );
}
