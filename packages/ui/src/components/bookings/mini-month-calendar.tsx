"use client";

import { ChevronLeft, ChevronRight } from "../../svg";
import { cn } from "../../utils/cn";
import { formatDate, toDateKey } from "../../utils/date";
import type { MiniMonthCalendarProps } from "../../types/bookings";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

export function MiniMonthCalendar(props: MiniMonthCalendarProps) {
  const { month, selected, onMonthChange, onSelect } = props;
  const todayKey = formatDate({ date: new Date(), as: "value" });
  const selectedKey = toDateKey(selected);

  const shiftMonth = (amount: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-default-900">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-default-100 text-default-700 transition-colors hover:bg-primary/15 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-default-100 text-default-700 transition-colors hover:bg-primary/15 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-default-400"
          >
            {day}
          </div>
        ))}

        {monthGrid(month).map((day) => {
          const key = toDateKey(day);
          const inMonth = day.getMonth() === month.getMonth();
          const active = key === selectedKey;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(day)}
              className="group flex h-11 cursor-pointer items-center justify-center xl:h-10"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors xl:h-8 xl:w-8 xl:text-xs",
                  !inMonth && "text-default-300",
                  inMonth && !active && "text-default-800 group-hover:bg-primary/10",
                  isToday && !active && "font-semibold text-primary ring-1 ring-primary",
                  active && "bg-primary font-semibold text-primary-foreground shadow-sm",
                )}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
