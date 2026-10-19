"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantityStepper(props: QuantityStepperProps) {
  const { value, onChange, min = 0, max = 50, className } = props;
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDecrease}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          canDecrease
            ? "cursor-pointer bg-default-100 text-default-600 hover:bg-default-200"
            : "cursor-not-allowed bg-default-50 text-default-300",
        )}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <span className="min-w-5 text-center text-sm font-semibold tabular-nums text-default-900">
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canIncrease}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          canIncrease
            ? "cursor-pointer bg-primary/15 text-primary hover:bg-primary/25"
            : "cursor-not-allowed bg-default-50 text-default-300",
        )}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
