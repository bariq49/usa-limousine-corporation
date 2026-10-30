"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
import { Form } from "../form";
import { Input } from "../input";
import { formatDate, fromDateKey, toDateKey } from "../../utils/date";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "./labels";
import { DayRideCards } from "./day-ride-cards";
import { MiniMonthCalendar } from "./mini-month-calendar";
import type { BookingType, CalendarEvent } from "../../types/booking-model";
import type { BookingCalendarProps } from "../../types/bookings";

const ALL_BOOKING_TYPES: BookingType[] = ["ONE_WAY", "RETURN", "HOURLY"];

const TYPE_OPTIONS = [{ value: "ALL", label: "All trip types" }].concat(
  ALL_BOOKING_TYPES.map((type) => ({
    value: type,
    label: BOOKING_TYPE_LABELS[type],
  })),
);

type TypeFilterValues = {
  bookingType: string;
};

export function BookingCalendar(props: BookingCalendarProps) {
  const {
    events,
    isFetching = false,
    onQueryChange,
    basePath,
    title = "Booking Calendar",
    description = "Pick a date to see the rides booked for that day.",
    getBooking,
    bookingQueryKey,
    onCancelBooking,
    cancelPending,
    onEditBooking,
  } = props;
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);
  const rangeRef = useRef<{ start: string; end: string } | null>(null);

  const today = formatDate({ date: new Date(), as: "value" });
  const [displayMonth, setDisplayMonth] = useState(() => fromDateKey(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const typeForm = useForm<TypeFilterValues>({
    defaultValues: { bookingType: "ALL" },
  });
  const bookingTypeValue = useWatch({ control: typeForm.control, name: "bookingType" }) ?? "ALL";
  const bookingTypes =
    bookingTypeValue === "ALL" ? ALL_BOOKING_TYPES : [bookingTypeValue as BookingType];

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

  useEffect(() => {
    if (rangeRef.current) emitQuery(rangeRef.current, bookingTypes);
  }, [bookingTypes, emitQuery]);

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
    setSelectedDate(key);
    setDisplayMonth(fromDateKey(key));
    calendarRef.current?.getApi().gotoDate(key);
  }, []);

  const dayCellClassNames = useCallback(
    (arg: DayCellContentArg) => (arg["dateStr"] === selectedDate ? ["fc-day-selected"] : []),
    [selectedDate],
  );

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
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-xs max-md:overflow-visible max-md:border-none max-md:bg-transparent max-md:shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-5 max-md:border-none max-md:px-0 max-md:pt-0 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0 space-y-1">
              <h2 className="text-xl font-semibold text-default-900">{title}</h2>
              <p className="text-xs text-default-600 md:text-sm">{description}</p>
            </div>
            <Form {...typeForm}>
              <Input
                name="bookingType"
                type="select"
                options={TYPE_OPTIONS}
                className="w-full md:w-40"
                inputClassName="h-9 bg-transparent"
              />
            </Form>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="border-b border-border bg-default-50/70 px-5 py-5 max-md:border-none max-md:bg-transparent max-md:px-0 max-md:pt-1 xl:border-b-0 xl:border-r">
              <p className="mb-3 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-default-500 md:block">
                Jump to date
              </p>
              <div className="w-full rounded-md border border-border bg-card p-4 max-md:border-none max-md:bg-transparent max-md:p-0">
                <MiniMonthCalendar
                  month={displayMonth}
                  selected={fromDateKey(selectedDate)}
                  onMonthChange={(month) => {
                    setDisplayMonth(month);
                    calendarRef.current?.getApi().gotoDate(toDateKey(month));
                  }}
                  onSelect={selectDate}
                />
              </div>

              <div className="mt-4 border-t border-border pt-4 md:hidden">
                <p className="truncate text-base font-semibold text-default-900">
                  {formatDate({ date: selectedDate, options: { weekday: "long" } })}
                </p>
                <p className="mt-0.5 text-xs text-default-500">
                  {selectedRides.length === 0 ? (
                    "No rides scheduled"
                  ) : (
                    <>
                      You have{" "}
                      <span className="font-semibold text-default-900">
                        {selectedRides.length} {selectedRides.length === 1 ? "ride" : "rides"}
                      </span>{" "}
                      scheduled
                    </>
                  )}
                </p>
              </div>
            </aside>

            <div className="relative hidden min-w-0 p-3 sm:p-5 md:block">
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
                  headerToolbar={false}
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

      <DayRideCards
        day={{ date: selectedDate, rides: selectedRides }}
        basePath={basePath}
        getBooking={getBooking}
        bookingQueryKey={bookingQueryKey}
        onCancelBooking={onCancelBooking}
        cancelPending={cancelPending}
        onEditBooking={onEditBooking}
      />
    </div>
  );
}
