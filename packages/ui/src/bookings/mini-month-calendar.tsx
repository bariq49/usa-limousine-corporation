"use client";

import { APP_TIMEZONE } from "../constants/index";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronLeft, ChevronRight } from "../svg";
import { cn } from "../utils/cn";

type Props = {
  month: Date;
  selected: Date;
  onMonthChange: (date: Date) => void;
  onSelect: (date: Date) => void;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Six weeks of days covering `month`, starting on Sunday. */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

/** Small month picker used to jump the booking calendar to a date. */
export function MiniMonthCalendar({ month, selected, onMonthChange, onSelect }: Props) {
  const today = new Date(`${formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd")}T00:00:00`);
  const shiftMonth = (amount: number) =>
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1));

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-default-200 text-default-600 hover:border-primary/40 hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-default-900">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-default-200 text-default-600 hover:border-primary/40 hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase text-default-400"
          >
            {day}
          </div>
        ))}

        {monthGrid(month).map((day) => {
          const inMonth = day.getMonth() === month.getMonth();
          const active = isSameDay(day, selected);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium",
                !inMonth && "text-default-300",
                inMonth && !active && "text-default-700 hover:bg-primary/10",
                isToday && !active && "bg-default-100 font-semibold",
                active && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
