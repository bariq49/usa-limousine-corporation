"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "../svg";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";
import { scheduleScrollLockReset } from "../layout/scroll-lock-fix";
const selectVariants = cva(
  " w-full  px-3 h-10 text-sm flex [&>svg]:h-5 [&>svg]:w-5    justify-between items-center  read-only:bg-background  disabled:cursor-not-allowed disabled:opacity-50  transition duration-300 ",
  {
    variants: {
      color: {
        default:
          "border-default-300 text-default-500 focus:outline-hidden focus:border-default-500/50 disabled:bg-default-200  placeholder:text-accent-foreground/50 [&>svg]:stroke-default-600",
        primary:
          "border-primary text-primary focus:outline-hidden focus:border-primary-700 disabled:bg-primary/30 disabled:placeholder:text-primary  placeholder:text-primary/70 [&>svg]:stroke-primary",
        info: "border-info/50 text-info focus:outline-hidden focus:border-info-700 disabled:bg-info/30 disabled:placeholder:text-info  placeholder:text-info/70",
        warning:
          "border-warning/50 text-warning focus:outline-hidden focus:border-warning-700 disabled:bg-warning/30 disabled:placeholder:text-info  placeholder:text-warning/70",
        success:
          "border-success/50 text-success focus:outline-hidden focus:border-success-700 disabled:bg-success/30 disabled:placeholder:text-info  placeholder:text-success/70",
        destructive:
          "border-destructive/50 text-destructive focus:outline-hidden focus:border-destructive-700 disabled:bg-destructive/30 disabled:placeholder:text-destructive  placeholder:text-destructive/70",
      },
      variant: {
        flat: "read-only:bg-default-500/10 ",
        underline: "border-b",
        bordered: "border",
        faded: "border border-default-300 read-only:bg-default-100",
        ghost: "border-0 focus:border",
        "flat-underline": "read-only:bg-default-100 border-b",
      },
      shadow: {
        none: "shadow-none",
        xs: "shadow-sm",
        sm: "shadow",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        "2xl": "shadow-2xl",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-[20px]",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-9 text-xs",
        lg: "h-10 text-sm",
        xl: "h-12 text-base",
      },
    },
    compoundVariants: [
      {
        variant: "flat",
        color: "primary",
        className: "read-only:bg-primary/10",
      },
      {
        variant: "flat",
        color: "info",
        className: "read-only:bg-info/10",
      },
      {
        variant: "flat",
        color: "warning",
        className: "read-only:bg-warning/10",
      },
      {
        variant: "flat",
        color: "success",
        className: "read-only:bg-success/10",
      },
      {
        variant: "flat",
        color: "destructive",
        className: "read-only:bg-destructive/10",
      },
      {
        variant: "faded",
        color: "primary",
        className: "read-only:bg-primary/10 border-primary/30",
      },
      {
        variant: "faded",
        color: "info",
        className: "read-only:bg-info/10 border-info/30",
      },
      {
        variant: "faded",
        color: "warning",
        className: "read-only:bg-warning/10 border-warning/30",
      },
      {
        variant: "faded",
        color: "success",
        className: "read-only:bg-success/10 border-success/30",
      },
      {
        variant: "faded",
        color: "destructive",
        className: "read-only:bg-destructive/10 border-destructive/30",
      },
    ],
    defaultVariants: {
      color: "default",
      size: "lg",
      variant: "bordered",
      radius: "md",
    },
  },
);

function Select({ onOpenChange, ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      onOpenChange={(open) => {
        if (open) {
          scheduleScrollLockReset();
        }
        onOpenChange?.(open);
      }}
      {...props}
    />
  );
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

interface SelectTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectVariants> {
  icon?: React.ReactNode;
  color?: "default" | "primary" | "info" | "warning" | "success" | "destructive";
}

function SelectTrigger({
  className,
  children,
  color,
  size,
  radius,
  variant,
  icon = <ChevronDown />,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(selectVariants({ color, size, radius, variant }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>{icon}</SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "relative z-[10000] max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "max-h-[min(24rem,var(--radix-select-content-available-height))] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("py-1.5 px-1.5 text-xs font-normal text-default-500", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute ltr:right-2 rtl:left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  selectVariants,
};
