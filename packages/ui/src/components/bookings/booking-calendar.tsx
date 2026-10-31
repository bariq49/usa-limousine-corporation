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
import { Button } from "../button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import { Form } from "../form";
import { Input } from "../input";
import { Filter } from "../../svg";
import { formatDate, fromDateKey, toDateKey } from "../../utils/date";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "./labels";
import { DayRideCards } from "./day-ride-cards";
import { MiniMonthCalendar } from "./mini-month-calendar";
import type { BookingType, CalendarEvent } from "../../types/booking-model";
import type { BookingCalendarProps } from "../../types/bookings";

const ALL_BOOKING_TYPES: BookingType[] = ["ONE_WAY", "RETURN", "HOURLY"];

type TypeFilterValues = Record<BookingType, boolean>;

type MobileTypeFilterValues = {
  mobile_ONE_WAY: boolean;
  mobile_RETURN: boolean;
  mobile_HOURLY: boolean;
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const typeForm = useForm<TypeFilterValues>({
    defaultValues: {
      ONE_WAY: true,
      RETURN: true,
      HOURLY: true,
    },
  });
  const mobileTypeForm = useForm<MobileTypeFilterValues>({
    defaultValues: { mobile_ONE_WAY: true, mobile_RETURN: true, mobile_HOURLY: true },
  });
  const watchedTypes = useWatch({ control: typeForm.control });
  const bookingTypes = useMemo(
    () => ALL_BOOKING_TYPES.filter((type) => watchedTypes[type]),
    [watchedTypes.HOURLY, watchedTypes.ONE_WAY, watchedTypes.RETURN],
  );

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
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-semibold text-default-900">{title}</h2>
                <p className="text-xs text-default-600 md:text-sm">{description}</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 border-0 bg-transparent text-default-600 shadow-none hover:bg-transparent hover:text-default-900 md:hidden"
                aria-label="Open trip type filter"
                onClick={() => {
                  mobileTypeForm.reset({
                    mobile_ONE_WAY: bookingTypes.includes("ONE_WAY"),
                    mobile_RETURN: bookingTypes.includes("RETURN"),
                    mobile_HOURLY: bookingTypes.includes("HOURLY"),
                  });
                  setFiltersOpen(true);
                }}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogContent className="max-w-md gap-5 max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:overflow-y-auto max-md:rounded-t-2xl max-md:rounded-b-none max-md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <DialogHeader className="text-left">
                <DialogTitle>Trip type filter</DialogTitle>
                <DialogDescription>
                  Choose which trip types to show on your calendar.
                </DialogDescription>
              </DialogHeader>
              <Form {...mobileTypeForm}>
                <div className="grid gap-4">
                  {ALL_BOOKING_TYPES.map((type) => (
                    <Input
                      key={type}
                      name={`mobile_${type}`}
                      type="checkbox"
                      label={BOOKING_TYPE_LABELS[type]}
                      checkboxSize="md"
                    />
                  ))}
                </div>
              </Form>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  const mobileFilters = mobileTypeForm.getValues();
                  typeForm.reset({
                    ONE_WAY: mobileFilters.mobile_ONE_WAY,
                    RETURN: mobileFilters.mobile_RETURN,
                    HOURLY: mobileFilters.mobile_HOURLY,
                  });
                  setFiltersOpen(false);
                }}
              >
                Apply filter
              </Button>
            </DialogContent>
          </Dialog>

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

              <div className="mt-5 hidden border-t border-border pt-4 md:block">
                <p className="mb-3 text-sm font-semibold text-default-800">Filter by trip type</p>
                <Form {...typeForm}>
                  <div className="grid gap-3">
                    {ALL_BOOKING_TYPES.map((type) => (
                      <Input
                        key={type}
                        name={type}
                        type="checkbox"
                        label={BOOKING_TYPE_LABELS[type]}
                        checkboxSize="md"
                      />
                    ))}
                  </div>
                </Form>
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
