"use client";

import { useState } from "react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { BookingCalendar } from "@usa-limousine-corporation/ui/components/bookings/booking-calendar";
import type { CalendarQuery } from "@usa-limousine-corporation/ui/types/booking-model";
import { bookingKeys, useBookingCalendar, useCancelBooking } from "@/hooks/queries/use-bookings";
import { getBooking } from "@/lib/api/bookings";

const crumbs = [{ label: "Upcoming Rides" }];

export default function BookingCalendarPage() {
  const [query, setQuery] = useState<CalendarQuery | null>(null);
  const { data, isFetching } = useBookingCalendar(query);
  const cancelMutation = useCancelBooking();

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <BookingCalendar
        title="Upcoming Rides"
        events={data}
        isFetching={isFetching}
        onQueryChange={setQuery}
        basePath="/bookings"
        getBooking={getBooking}
        bookingQueryKey={bookingKeys.detail}
        onCancelBooking={({ id, reason }) => cancelMutation.mutateAsync({ id, reason })}
        cancelPending={cancelMutation.isPending}
        onEditBooking={() => undefined}
      />
    </div>
  );
}
