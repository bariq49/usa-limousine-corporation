"use client";

import { APP_TIMEZONE } from "../constants/index";
import { formatInTimeZone } from "date-fns-tz";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type {
  DatesSetArg,
  DayCellContentArg,
  EventClickArg,
  EventInput,
  EventMountArg,
} from "@fullcalendar/core";
import { Card, CardContent } from "../components/card";
import { BookingTypeFilter } from "./booking-type-filter";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "./labels";
import { MiniMonthCalendar } from "./mini-month-calendar";
import type { BookingType, CalendarEvent, CalendarQuery } from "./types";

const ALL_BOOKING_TYPES: BookingType[] = ["ONE_WAY", "RETURN", "HOURLY"];

type Props = {
  events?: CalendarEvent[] | undefined;
  isFetching?: boolean;
  /** Called with the visible range and trip types whenever either changes. */
  onQueryChange: (query: CalendarQuery) => void;
  /** Booking detail route; events link to `${basePath}/${id}`. */
  basePath: string;
};

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

/** Month view of bookings by pickup date, with a mini calendar and trip-type filter. */
export function BookingCalendar({ events, isFetching = false, onQueryChange, basePath }: Props) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  const rangeRef = useRef<{ start: string; end: string } | null>(null);
  const today = formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
  const [displayMonth, setDisplayMonth] = useState<Date>(() => new Date(`${today}T00:00:00`));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(`${today}T00:00:00`));
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>(ALL_BOOKING_TYPES);

  const emitQuery = useCallback(
    (range: { start: string; end: string }, types: BookingType[]) => {
      onQueryChange({
        start: range.start,
        end: range.end,
        // Every type selected means no filter; none selected shows nothing.
        bookingType: types.length === ALL_BOOKING_TYPES.length ? undefined : types,
      });
    },
    [onQueryChange],
  );

  const calendarEvents: EventInput[] = useMemo(
    () =>
      (events ?? [])
        .filter((event) => bookingTypes.includes(event.bookingType))
        .map((event) => ({
          id: event.id,
          title: `${event.pickupTime} · ${event.bookingNumber}`,
          start: event.pickupDate,
          allDay: true,
          backgroundColor: BOOKING_TYPE_COLORS[event.bookingType],
          borderColor: BOOKING_TYPE_COLORS[event.bookingType],
          textColor: "#ffffff",
          extendedProps: event,
        })),
    [events, bookingTypes],
  );

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setDisplayMonth(date);
    calendarRef.current?.getApi().gotoDate(date);
  }, []);

  const dayCellClassNames = useCallback(
    (arg: DayCellContentArg) => (isSameDay(arg.date, selectedDate) ? ["fc-day-selected"] : []),
    [selectedDate],
  );

  const handleTypesChange = (next: BookingType[]) => {
    setBookingTypes(next);
    if (rangeRef.current) {
      emitQuery(rangeRef.current, next);
    }
  };

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-default-50/70 px-5 py-5 xl:border-b-0 xl:border-r">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-default-500">
              Jump to date
            </p>
            <div className="w-full rounded-xl border border-border bg-card p-4">
              <MiniMonthCalendar
                month={displayMonth}
                selected={selectedDate}
                onMonthChange={setDisplayMonth}
                onSelect={selectDate}
              />
            </div>

            <BookingTypeFilter
              options={ALL_BOOKING_TYPES}
              value={bookingTypes}
              onChange={handleTypesChange}
              className="mt-5"
            />
          </aside>

          <div className="relative min-w-0 p-3 sm:p-5">
            {isFetching ? (
              <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-default-500">
                Updating...
              </div>
            ) : null}

            <div className="booking-calendar">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={today}
                now={today}
                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                buttonText={{ today: "Today" }}
                height="auto"
                events={calendarEvents}
                datesSet={(arg: DatesSetArg) => {
                  // FullCalendar's end is exclusive; the API expects the last visible day.
                  const lastDay = new Date(arg.end);
                  lastDay.setDate(lastDay.getDate() - 1);
                  const range = { start: toDateKey(arg.start), end: toDateKey(lastDay) };
                  rangeRef.current = range;
                  emitQuery(range, bookingTypes);
                }}
                dateClick={(arg: DateClickArg) => selectDate(arg.date)}
                dayCellClassNames={dayCellClassNames}
                eventClick={(arg: EventClickArg) => {
                  arg.jsEvent.preventDefault();
                  router.push(`${basePath}/${arg.event.id}`);
                }}
                eventDidMount={(arg: EventMountArg) => {
                  const event = arg.event.extendedProps as CalendarEvent;
                  arg.el.title = [
                    `${event.bookingNumber} · ${BOOKING_TYPE_LABELS[event.bookingType]}`,
                    `${event.customerName} · ${event.vehicleName}`,
                    `Pickup ${event.pickupTime}: ${event.pickupAddress}`,
                    event.dropoffAddress ? `Drop-off: ${event.dropoffAddress}` : null,
                  ]
                    .filter(Boolean)
                    .join("\n");
                }}
                nowIndicator
                editable={false}
                selectable={false}
                dayMaxEvents={4}
                eventDisplay="block"
                displayEventTime={false}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
