"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      color: {
        default: "border-transparent bg-primary text-primary-foreground",
        destructive: "bg-destructive border-transparent text-destructive-foreground",
        success: "bg-success border-transparent text-success-foreground",
        info: "bg-info border-transparent text-info-foreground",
        warning: "bg-warning border-transparent text-warning-foreground",
        secondary: "bg-secondary border-transparent text-foreground",
        dark: "bg-accent-foreground border-transparent text-accent",
      },
      variant: {
        outline: "border border-current bg-background",
        soft: "",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "destructive",
        className: "text-destructive",
      },
      {
        variant: "outline",
        color: "success",
        className: "text-success",
      },
      {
        variant: "outline",
        color: "info",
        className: "text-info",
      },
      {
        variant: "outline",
        color: "warning",
        className: "text-warning",
      },
      {
        variant: "outline",
        color: "dark",
        className: "text-accent-foreground",
      },
      {
        variant: "outline",
        color: "secondary",
        className: "text-muted-foreground dark:bg-transparent border-default-500",
      },
      {
        variant: "outline",
        color: "default",
        className: "text-primary",
      },
      {
        variant: "soft",
        color: "default",
        className:
          "text-orange-800 dark:text-orange-200 bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800",
      },
      {
        variant: "soft",
        color: "info",
        className:
          "text-sky-800 dark:text-sky-200 bg-sky-100/80 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800",
      },
      {
        variant: "soft",
        color: "warning",
        className:
          "text-amber-800 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800",
      },
      {
        variant: "soft",
        color: "destructive",
        className:
          "text-red-800 dark:text-red-200 bg-red-100/80 dark:bg-red-950/60 border border-red-200 dark:border-red-800",
      },
      {
        variant: "soft",
        color: "success",
        className:
          "text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800",
      },
      {
        variant: "soft",
        color: "secondary",
        className:
          "text-default-800 dark:text-default-200 bg-default-100 dark:bg-default-800/60 border border-default-200 dark:border-default-700",
      },
      {
        variant: "soft",
        color: "dark",
        className: "text-accent-foreground bg-accent/60 border border-border",
      },
    ],
    defaultVariants: {
      color: "default",
    },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, VariantProps<typeof badgeVariants> {}

function Badge(props: BadgeProps) {
  const { className, color, variant, children, onClick, id, title, style, role, tabIndex } = props;

  return (
    <div
      className={cn(badgeVariants({ color, variant }), className)}
      onClick={onClick}
      id={id}
      title={title}
      style={style}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
