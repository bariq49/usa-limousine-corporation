"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock } from "../svg";
import { APP_TIMEZONE } from "../constants/index";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { TimeColumn } from "./time-column";

type Period = "AM" | "PM";

export type TimePickerProps = {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  placeholder?: string | undefined;
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS: Period[] = ["AM", "PM"];

function to24Hour(hour12: number, period: Period): number {
  if (period === "AM") {
    return hour12 === 12 ? 0 : hour12;
  }
  return hour12 === 12 ? 12 : hour12 + 12;
}

function from24Hour(hour24: number): { hour12: number; period: Period } {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, period };
}

function formatDisplay(hour24: number, minute: number): string {
  const { hour12, period } = from24Hour(hour24);
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

function nowInTimezone(timezone: string): { hour12: number; minute: number; period: Period } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const hour24 = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const { hour12, period } = from24Hour(hour24 === 24 ? 0 : hour24);
  return { hour12, minute, period };
}

export function TimePicker(props: TimePickerProps) {
  const { value, onChange, disabled, error, className, placeholder = "" } = props;
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

  const getInitialTime = useCallback(() => nowInTimezone(timezone), [timezone]);

  const [hour12, setHour12] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);

  useEffect(() => {
    if (!value) {
      const initial = getInitialTime();
      setHour12(initial.hour12);
      setMinute(initial.minute);
      setPeriod(initial.period);
      return;
    }

    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match?.[1] != null && match[2] != null) {
      const parsed = from24Hour(parseInt(match[1], 10));
      setHour12(parsed.hour12);
      setMinute(parseInt(match[2], 10));
      setPeriod(parsed.period);
    }
  }, [value, getInitialTime]);

  useEffect(() => {
    if (!open || hour12 === null || minute === null || period === null) {
      return;
    }
    const hour24 = to24Hour(hour12, period);
    const formatted = `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    if (formatted !== value) {
      onChange(formatted);
    }
  }, [hour12, minute, period, open, onChange, value]);

  const displayVal = useMemo(() => {
    if (!value) {
      return placeholder || "";
    }
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match?.[1] == null || match[2] == null) {
      return value;
    }
    return formatDisplay(parseInt(match[1], 10), parseInt(match[2], 10));
  }, [value, placeholder]);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 280),
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
      data-picker-filled={displayVal ? "" : undefined}
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2 text-left",
          className,
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer read-only:cursor-pointer",
          error && "border-destructive text-destructive",
        )}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
      >
        {displayVal ? (
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              value ? "font-medium text-default-900" : "text-default-400",
            )}
          >
            {displayVal}
          </span>
        ) : (
          <span className="min-w-0 flex-1" aria-hidden />
        )}
        <Clock className="h-4 w-4 shrink-0 text-default-400" />
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
              className="rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="grid grid-cols-3 gap-2.5">
                <TimeColumn
                  label="Hour"
                  values={HOURS_12}
                  selected={hour12}
                  onSelect={setHour12}
                  formatValue={(val) => String(val)}
                />
                <TimeColumn
                  label="Minute"
                  values={MINUTES}
                  selected={minute}
                  onSelect={setMinute}
                />
                <TimeColumn label="AM/PM" values={PERIODS} selected={period} onSelect={setPeriod} />
              </div>

              <Button
                type="button"
                color="primary"
                onClick={() => setOpen(false)}
                disabled={hour12 === null || minute === null || period === null}
                className="mt-3 w-full py-2 text-xs font-semibold"
              >
                Done
              </Button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
