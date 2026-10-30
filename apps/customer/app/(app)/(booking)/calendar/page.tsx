"use client";

import { useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { BookingCalendar } from "@usa-limousine-corporation/ui/components/bookings/booking-calendar";
import type { CalendarQuery } from "@usa-limousine-corporation/ui/types/booking-model";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import { bookingQueryKeys, useBookingCalendar, useCancelBooking } from "@/hooks/queries/use-bookings";
import { getBooking } from "@/lib/api/bookings";

const crumbs = [
  { label: "Home", href: "/dashboard" },
  { label: "Upcoming Rides" },
];

export default function BookingCalendarPage() {
  const [query, setQuery] = useState<CalendarQuery | null>(null);
  const { data, isFetching } = useBookingCalendar(query);
  const cancelMutation = useCancelBooking();
  const now = formatDateTime({ date: new Date(), as: "value" });

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <BookingCalendar
        events={data?.filter((event) => `${event.pickupDate} ${event.pickupTime}` >= now)}
        isFetching={isFetching}
        onQueryChange={setQuery}
        basePath="/bookings"
        title="Upcoming Rides"
        description="Pick a date to see your rides for that day."
        getBooking={getBooking}
        bookingQueryKey={bookingQueryKeys.detail}
        onCancelBooking={({ id, reason }) => cancelMutation.mutateAsync({ id, reason })}
        cancelPending={cancelMutation.isPending}
        onEditBooking={() => undefined}
      />
    </div>
  );
}
