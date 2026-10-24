"use client";

import * as React from "react";
import { Minus, Plus } from "../svg";
import { cn } from "../utils/cn";

export interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  hasError?: boolean;
  className?: string | undefined;
}

/** Minus / value / plus stepper for small quantities. */
export function Counter({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  disabled = false,
  hasError = false,
  className,
}: CounterProps) {
  const parsedValue = Number(value);
  const currentValue = Number.isNaN(parsedValue) ? min : Math.min(max, Math.max(min, parsedValue));

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/[^0-9]/g, "");
    const nextValue = rawValue === "" ? 0 : parseInt(rawValue, 10);
    onChange(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div
      className={cn(
        "grid h-10 grid-cols-[40px_1fr_40px] items-center overflow-hidden rounded-md border border-default-300 bg-card text-default-900 transition-colors 2xl:h-12",
        hasError && "border-destructive",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, currentValue - step))}
        disabled={disabled || currentValue <= min}
        className="flex h-full cursor-pointer items-center justify-center border-r border-default-100 text-default-600 hover:bg-default-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={currentValue}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-full bg-transparent px-2 text-center text-sm font-bold tabular-nums focus:outline-none"
      />

      <button
        type="button"
        onClick={() => onChange(Math.min(max, currentValue + step))}
        disabled={disabled || currentValue >= max}
        className="flex h-full cursor-pointer items-center justify-center border-l border-default-100 text-default-600 hover:bg-default-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
