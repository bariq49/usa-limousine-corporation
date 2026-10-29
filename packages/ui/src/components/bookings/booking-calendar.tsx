"use client";

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
  EventSourceInput,
} from "@fullcalendar/core";
import { Card, CardContent } from "../card";
import { formatDate } from "../../utils/date";
import { BookingTypeFilter } from "./booking-type-filter";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "./labels";
import { MiniMonthCalendar } from "./mini-month-calendar";
import type { BookingType, CalendarEvent } from "../../types/booking-model";
import type { BookingCalendarProps } from "../../types/bookings";

const ALL_BOOKING_TYPES: BookingType[] = ["ONE_WAY", "RETURN", "HOURLY"];


function toDateKey(date: Date | string) {
  if (typeof date === "string") return date.slice(0, 10);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromDateKey(key: string) {
  return new Date(`${key}T00:00:00`);
}

export function BookingCalendar(props: BookingCalendarProps) {
  const { events, isFetching = false, onQueryChange, basePath } = props;
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  const rangeRef = useRef<{ start: string; end: string } | null>(null);

  const today = formatDate({ date: new Date(), as: "value" });
  const [displayMonth, setDisplayMonth] = useState(() => fromDateKey(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>(ALL_BOOKING_TYPES);

  const emitQuery = useCallback(
    (range: { start: string; end: string }, types: BookingType[]) => {
      onQueryChange({
        start: range.start,
        end: range.end,
        bookingType: types.length === ALL_BOOKING_TYPES.length ? undefined : types,
      });
    },
    [onQueryChange],
  );

  const filteredEvents = useMemo(
    () => (events ?? []).filter((event) => bookingTypes.includes(event.bookingType)),
    [events, bookingTypes],
  );

  const calendarEvents: EventInput[] = useMemo(
    () =>
      filteredEvents.map((event) => ({
        id: event.id,
        title: `${event.pickupTime} · ${event.bookingNumber}`,
        start: event.pickupDate,
        allDay: true,
        backgroundColor: BOOKING_TYPE_COLORS[event.bookingType],
        borderColor: BOOKING_TYPE_COLORS[event.bookingType],
        textColor: "#ffffff",
        extendedProps: event,
      })),
    [filteredEvents],
  );

  const selectedRides = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.pickupDate === selectedDate)
        .sort((a, b) => a.pickupTime.localeCompare(b.pickupTime)),
    [filteredEvents, selectedDate],
  );

  const selectDate = useCallback((date: Date | string) => {
    const key = toDateKey(date);
    const next = fromDateKey(key);
    setSelectedDate(key);
    setDisplayMonth(next);
    calendarRef.current?.getApi().gotoDate(key);
  }, []);

  const dayCellClassNames = useCallback(
    (arg: DayCellContentArg) => (arg["dateStr"] === selectedDate ? ["fc-day-selected"] : []),
    [selectedDate],
  );

  const handleTypesChange = (next: BookingType[]) => {
    setBookingTypes(next);
    if (rangeRef.current) emitQuery(rangeRef.current, next);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const lastDay = new Date(arg.end);
    lastDay.setDate(lastDay.getDate() - 1);
    const range = {
      start: toDateKey(arg.start),
      end: toDateKey(lastDay),
    };
    rangeRef.current = range;
    emitQuery(range, bookingTypes);

    const mid = new Date(arg.view.currentStart);
    mid.setDate(15);
    setDisplayMonth(new Date(mid.getFullYear(), mid.getMonth(), 1));
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
                selected={fromDateKey(selectedDate)}
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

            <div className="mt-5 border-t border-border pt-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-default-500">
                  Selected day
                </p>
                <p className="text-xs font-medium text-default-600">
                  {formatDate({ date: selectedDate })}
                </p>
              </div>

              {selectedRides.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-3 py-5 text-center text-xs text-default-500">
                  No rides on this day.
                </p>
              ) : (
                <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {selectedRides.map((ride) => (
                    <li key={ride.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`${basePath}/${ride.id}`)}
                        className="flex w-full cursor-pointer items-start gap-2.5 rounded-md border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: BOOKING_TYPE_COLORS[ride.bookingType] }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] text-default-400">
                            {ride.pickupTime} · {BOOKING_TYPE_LABELS[ride.bookingType]}
                          </span>
                          <span className="mt-0.5 block truncate text-sm font-semibold text-default-900">
                            {ride.bookingNumber}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-default-500">
                            {ride.customerName}
                            {ride.vehicleName ? ` · ${ride.vehicleName}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                events={calendarEvents as EventSourceInput}
                datesSet={handleDatesSet}
                dateClick={(arg: DateClickArg) => selectDate(arg.dateStr)}
                selectable
                selectMirror
                select={(info) => {
                  selectDate(info.startStr.slice(0, 10));
                  info.view.calendar.unselect();
                }}
                unselectAuto
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
