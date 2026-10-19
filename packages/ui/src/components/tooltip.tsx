"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const tooltipVariants = cva(
  "z-50 rounded-md px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      color: {
        secondary: "border border-border bg-popover text-popover-foreground",
        primary: "border border-primary bg-primary text-primary-foreground",
        warning: "border border-warning bg-warning text-warning-foreground",
        info: "border border-info bg-info text-info-foreground",
        success: "border border-success bg-success text-success-foreground",
        destructive: "border border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  },
);

interface TolTipProps
  extends
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipVariants> {
  color?: "primary" | "secondary" | "warning" | "info" | "success" | "destructive";
  showArrow?: boolean;
  arrowColor?: "primary" | "secondary" | "warning" | "info" | "success" | "destructive";
  arrowClassName?: string;
}

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipArrow({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Arrow>) {
  return <TooltipPrimitive.Arrow data-slot="tooltip-arrow" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  color,
  showArrow = true,
  arrowColor,
  arrowClassName,
  ...props
}: TolTipProps) {
  const effectiveArrowColor = arrowColor ?? (color === "secondary" ? "secondary" : "primary");
  const arrowColorClass =
    effectiveArrowColor === "secondary"
      ? "fill-popover"
      : effectiveArrowColor === "info"
        ? "fill-info"
        : effectiveArrowColor === "success"
          ? "fill-success"
          : effectiveArrowColor === "warning"
            ? "fill-warning"
            : effectiveArrowColor === "destructive"
              ? "fill-destructive"
              : "fill-primary";

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ color }), className)}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn("z-50", arrowColorClass, arrowClassName)}
            width={12}
            height={6}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow };
