"use client";

import type React from "react";
import { Minus, Plus } from "../svg";
import { cn } from "../utils/cn";

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  labelClassName?: string;
}

/** Compact round minus / plus control with an optional label. */
export function Stepper({
  value,
  min = 0,
  max = 99,
  onChange,
  icon,
  label,
  className,
  labelClassName,
}: StepperProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(icon || label) && (
        <div className={cn("flex items-center gap-1 text-sm text-primary", labelClassName)}>
          {icon}
          {label && <span className="font-semibold">{label}</span>}
        </div>
      )}
      <div className="flex items-center gap-1 sm:gap-2.5">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-6 h-6 flex items-center justify-center rounded-full border border-border text-gray-500 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-2xs sm:text-sm font-bold w-4 text-center select-none text-black">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-6 h-6 flex items-center justify-center rounded-full border border-border text-gray-500 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
