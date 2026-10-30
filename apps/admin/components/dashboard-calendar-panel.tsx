"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent, CardHeader } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import {
  BOOKING_TYPE_COLORS,
  BOOKING_TYPE_LABELS,
} from "@usa-limousine-corporation/ui/components/bookings/labels";
import { MiniMonthCalendar } from "@usa-limousine-corporation/ui/components/bookings/mini-month-calendar";
import { formatDate, formatTime } from "@usa-limousine-corporation/ui/utils/date";
import { useBookingCalendar } from "@/hooks/queries/use-bookings";

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DashboardCalendarPanel() {
  const [displayMonth, setDisplayMonth] = useState(() => {
    const key = formatDate({ date: new Date(), as: "value" }).slice(0, 7);
    return new Date(`${key}-01T00:00:00`);
  });
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(`${formatDate({ date: new Date(), as: "value" })}T00:00:00`),
  );

  const query = useMemo(
    () => ({
      start: toDateKey(new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)),
      end: toDateKey(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0)),
    }),
    [displayMonth],
  );
  const { data, isLoading, isFetching } = useBookingCalendar(query);
  const selectedKey = toDateKey(selectedDate);

  const rides = useMemo(
    () =>
      (data ?? [])
        .filter((event) => event.pickupDate === selectedKey)
        .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime)),
    [data, selectedKey],
  );

  return (
    <Card className="flex h-full w-full min-w-0 flex-col overflow-hidden max-md:border-none max-md:bg-transparent max-md:shadow-none">
      <CardHeader className="shrink-0 gap-1 border-none pb-0 max-md:px-0 max-md:pt-0 md:px-5 md:pt-4">
        <div className="text-xl font-semibold text-default-900">Ride Schedule</div>
        <p className="text-xs text-default-600 md:text-sm">
          {rides.length} ride{rides.length === 1 ? "" : "s"} on {formatDate({ date: selectedKey })}
        </p>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 px-0 py-4 md:p-5">
        <div className="shrink-0 rounded-md border border-border p-3">
          <MiniMonthCalendar
            month={displayMonth}
            selected={selectedDate}
            onMonthChange={setDisplayMonth}
            onSelect={(date) => {
              setSelectedDate(date);
              if (date.getMonth() !== displayMonth.getMonth()) {
                setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
              }
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 flex shrink-0 items-center justify-between px-0.5">
            <h3 className="text-sm font-semibold text-default-900">Rides of the Day</h3>
            {isFetching && !isLoading ? (
              <span className="text-xs text-default-400">Updating...</span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : rides.length === 0 ? (
            <p className="flex flex-1 items-center justify-center px-1 py-6 text-center text-sm text-default-500">
              No rides scheduled for this day.
            </p>
          ) : (
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {rides.slice(0, 3).map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between gap-2 border-l-4 py-2 pl-2.5"
                  style={{ borderLeftColor: BOOKING_TYPE_COLORS[ride.bookingType] }}
                >
                  <div className="min-w-0 leading-snug">
                    <p className="text-xs text-default-400">
                      {formatTime({ date: ride.pickupTime })}
                    </p>
                    <p className="truncate text-sm font-semibold text-default-900">
                      {ride.bookingNumber} · {BOOKING_TYPE_LABELS[ride.bookingType]}
                    </p>
                    <p className="truncate text-xs text-default-500">
                      <span className="font-medium text-primary">{ride.customerName}</span>
                      {ride.vehicleName ? ` · ${ride.vehicleName}` : ""}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-8 shrink-0 bg-default-100 px-3"
                  >
                    <Link href={`/bookings/${ride.id}`}>View</Link>
                  </Button>
                </div>
              ))}
              <Link
                href="/calendar"
                className="flex items-center justify-center pt-2 text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
