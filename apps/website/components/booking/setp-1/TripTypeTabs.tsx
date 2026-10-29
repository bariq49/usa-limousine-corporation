"use client";

import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { TRIP_TYPES } from "@/constants/booking-constants";
import type { TripType } from "@/types/booking.types";

const TABS = [
  { value: TRIP_TYPES.ONE_WAY, label: "One Way" },
  { value: TRIP_TYPES.HOURLY, label: "By the Hour" },
] as const;

interface TripTypeTabsProps {
  value: TripType;
  onChange: (value: TripType) => void;
  className?: string;
}

/** One-way vs hourly switch shown at the top of the trip form. */
export function TripTypeTabs({ value, onChange, className }: TripTypeTabsProps) {
  return (
    <div role="tablist" className={cn("grid grid-cols-2 overflow-hidden bg-white", className)}>
      {TABS.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "cursor-pointer py-3.5 text-sm font-bold uppercase tracking-wide transition-colors",
              isActive ? "bg-secondary text-white" : "text-black hover:bg-gray-50",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
