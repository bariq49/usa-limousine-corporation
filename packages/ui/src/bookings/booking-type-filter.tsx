"use client";

import { Checkbox } from "../components/checkbox";
import { cn } from "../utils/cn";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "./labels";
import type { BookingType } from "./types";

type Props = {
  options: BookingType[];
  value: BookingType[];
  onChange: (next: BookingType[]) => void;
  className?: string;
};

/** Checkbox list that filters the calendar by trip type, with each type's colour. */
export function BookingTypeFilter({ options, value, onChange, className }: Props) {
  const toggle = (bookingType: BookingType, checked: boolean) => {
    onChange(checked ? value.concat(bookingType) : value.filter((item) => item !== bookingType));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-default-500">
        Trip type
      </p>
      <div className="space-y-2.5">
        {options.map((option) => {
          const id = `booking-type-${option}`;
          return (
            <label
              key={option}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-default-700"
            >
              <Checkbox
                id={id}
                size="sm"
                checked={value.includes(option)}
                onCheckedChange={(next) => toggle(option, next === true)}
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: BOOKING_TYPE_COLORS[option] }}
              />
              <span className="font-medium">{BOOKING_TYPE_LABELS[option]}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
