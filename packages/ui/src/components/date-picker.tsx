"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { APP_TIMEZONE } from "../constants/index";
import { cn } from "../utils/cn";

export type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  placeholder?: string;
  /** When true, days before today (in APP_TIMEZONE) cannot be selected. */
  disablePast?: boolean;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayKeyInTimezone(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarDays(currentMonth: Date) {
  const startMonth = startOfMonth(currentMonth);
  const startDayOffset = (startMonth.getDay() + 6) % 7;
  const startDate = new Date(startMonth);
  startDate.setDate(startMonth.getDate() - startDayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    onChange,
    disabled,
    error,
    className,
    placeholder = "",
    disablePast = false,
  } = props;
  const timezone = APP_TIMEZONE;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayKey = useMemo(() => todayKeyInTimezone(timezone), [timezone]);
  const todayLocal = useMemo(() => parseDateKey(todayKey) ?? new Date(), [todayKey]);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(todayLocal));

  const selectedDate = useMemo(() => (value ? parseDateKey(value) : null), [value]);

  const displayValue = useMemo(() => {
    if (!selectedDate) {
      return placeholder || "";
    }
    return selectedDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [selectedDate, placeholder]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const checkIsDisabled = useCallback(
    (date: Date) => {
      if (!disablePast) {
        return false;
      }
      return toDateKey(date) < todayKey;
    },
    [disablePast, todayKey],
  );

  const handleSelect = (date: Date) => {
    onChange(toDateKey(date));
    setOpen(false);
  };

  const updatePosition = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 320),
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      data-picker-open={open ? "" : undefined}
      data-picker-filled={displayValue ? "" : undefined}
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2 text-left",
          className,
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          error && "border-destructive text-destructive",
        )}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
      >
        {displayValue ? (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-default-900">
            {displayValue}
          </span>
        ) : (
          <span className="min-w-0 flex-1" aria-hidden />
        )}
        <Calendar className="h-4 w-4 shrink-0 text-default-400" />
      </button>

      {mounted && open && dropdownPos
        ? createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                zIndex: 99999,
              }}
              className="rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={disablePast && isSameMonth(currentMonth, startOfMonth(todayLocal))}
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  className="cursor-pointer rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-20"
                >
                  <ChevronRight size={18} className="rotate-180 text-default-600" />
                </button>

                <h3 className="text-sm font-bold text-default-900">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>

                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="cursor-pointer rounded-full p-2 transition-colors hover:bg-primary/10"
                >
                  <ChevronRight size={18} className="text-default-600" />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-default-400">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {calendarDays.map((date, i) => {
                  const inactive = !isSameMonth(date, currentMonth);
                  const disabledDay = checkIsDisabled(date);
                  const selected = selectedDate ? isSameDay(date, selectedDate) : false;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => handleSelect(date)}
                      className={cn(
                        "relative rounded-md py-2 text-center transition-all focus:outline-none",
                        disabledDay && "cursor-not-allowed text-default-200",
                        !disabledDay && "cursor-pointer",
                        inactive && !disabledDay && "text-default-400",
                        !inactive && !disabledDay && "font-semibold text-default-800",
                        selected
                          ? "bg-primary font-bold text-primary-foreground shadow-md"
                          : !disabledDay && "hover:bg-primary/10",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
