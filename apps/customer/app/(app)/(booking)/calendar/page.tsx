"use client";

import { useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { BookingCalendar } from "@usa-limousine-corporation/ui/components/bookings/booking-calendar";
import type { CalendarQuery } from "@usa-limousine-corporation/ui/types/booking-model";
import { useBookingCalendar } from "@/hooks/queries/use-bookings";

const crumbs = [
  { label: "Home", href: "/dashboard" },
  { label: "Bookings", href: "/bookings" },
  { label: "Calendar" },
];

export default function BookingCalendarPage() {
  const [query, setQuery] = useState<CalendarQuery | null>(null);
  const { data, isFetching } = useBookingCalendar(query);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <BookingCalendar
        events={data}
        isFetching={isFetching}
        onQueryChange={setQuery}
        basePath="/bookings"
      />
    </div>
  );
}
