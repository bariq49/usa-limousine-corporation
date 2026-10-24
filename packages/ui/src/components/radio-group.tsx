"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { Circle } from "../svg";
import { cn } from "../utils/cn";
import { Label } from "./label";

const radioVariants = cva(
  "aspect-square rounded-full border border-default-400 text-primary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-7 w-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const RadioGroup = RadioGroupPrimitive.Root;

export function RadioGroupItem({
  className,
  size,
  children,
  id,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioVariants> & { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupPrimitive.Item
        id={id}
        className={cn(radioVariants({ size }), className)}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {children ? (
        <Label htmlFor={id} className="cursor-pointer font-normal text-default-600">
          {children}
        </Label>
      ) : null}
    </div>
  );
}
