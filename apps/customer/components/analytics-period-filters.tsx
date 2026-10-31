"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@usa-limousine-corporation/ui/components/dialog";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { SlidersHorizontal } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import {
  ANALYTICS_MONTH_OPTIONS,
  ANALYTICS_WINDOW_OPTIONS,
  ANALYTICS_YEAR_OPTIONS,
} from "@/lib/analytics-range";
import type { AnalyticsPeriod, AnalyticsWindow } from "@/lib/types/analytics";

type Values = {
  year: string;
  month: string;
  window: string;
};

function toValues(period: AnalyticsPeriod): Values {
  return {
    year: String(period.year),
    month: period.month ? String(period.month) : "all",
    window: period.window,
  };
}

function toPeriod(values: Values): AnalyticsPeriod {
  return {
    year: Number(values.year),
    month: !values.month || values.month === "all" ? null : Number(values.month),
    window: (values.window || "all") as AnalyticsWindow,
  };
}

function periodSummary(period: AnalyticsPeriod) {
  const month =
    ANALYTICS_MONTH_OPTIONS.find(
      (option) => option.value === (period.month ? String(period.month) : "all"),
    )?.label ?? "All months";
  const window =
    ANALYTICS_WINDOW_OPTIONS.find((option) => option.value === period.window)?.label ??
    "Full period";
  return `${period.year} · ${month} · ${window}`;
}

export function AnalyticsPeriodFilters(props: {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  className?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const form = useForm<Values>({ defaultValues: toValues(props.value) });
  const mobileForm = useForm<Values>({ defaultValues: toValues(props.value) });
  const watchedYear = useWatch({ control: form.control, name: "year" });
  const watchedMonth = useWatch({ control: form.control, name: "month" });
  const watchedWindow = useWatch({ control: form.control, name: "window" });

  useEffect(() => {
    const values = toValues(props.value);
    form.reset(values);
    mobileForm.reset(values);
  }, [form, mobileForm, props.value]);

  useEffect(() => {
    if (!watchedYear || !watchedWindow) return;
    const next = toPeriod({
      year: watchedYear,
      month: watchedMonth || "all",
      window: watchedWindow,
    });
    if (
      next.year === props.value.year &&
      next.month === props.value.month &&
      next.window === props.value.window
    ) {
      return;
    }
    props.onChange(next);
  }, [props, watchedMonth, watchedWindow, watchedYear]);

  return (
    <div className={cn("w-full md:w-auto", props.className)}>
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-default-900">Period filters</div>
          <p className="truncate text-xs text-default-500">{periodSummary(props.value)}</p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="shrink-0 border-border/70"
          aria-label="Open analytics filters"
          onClick={() => {
            mobileForm.reset(toValues(props.value));
            setSheetOpen(true);
          }}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <div className="hidden items-end gap-2 md:flex">
          <Input
            name="year"
            label="Year"
            type="select"
            options={ANALYTICS_YEAR_OPTIONS()}
            className="w-28"
            inputClassName="h-9 border-border/70 bg-card"
          />
          <Input
            name="month"
            label="Month"
            type="select"
            options={ANALYTICS_MONTH_OPTIONS}
            className="w-40"
            inputClassName="h-9 border-border/70 bg-card"
          />
          <Input
            name="window"
            label="Range"
            type="select"
            options={ANALYTICS_WINDOW_OPTIONS}
            className="w-40"
            inputClassName="h-9 border-border/70 bg-card"
          />
        </div>
      </Form>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-w-md gap-5 max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:overflow-y-auto max-md:rounded-t-2xl max-md:rounded-b-none max-md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <DialogHeader className="text-left">
            <DialogTitle>Analytics filters</DialogTitle>
            <DialogDescription>
              Choose year, month and a short range based on that period.
            </DialogDescription>
          </DialogHeader>
          <Form {...mobileForm}>
            <div className="grid gap-4">
              <Input
                name="year"
                label="Year"
                type="select"
                options={ANALYTICS_YEAR_OPTIONS()}
                inputClassName="h-11 bg-transparent"
              />
              <Input
                name="month"
                label="Month"
                type="select"
                options={ANALYTICS_MONTH_OPTIONS}
                inputClassName="h-11 bg-transparent"
              />
              <Input
                name="window"
                label="Range"
                type="select"
                options={ANALYTICS_WINDOW_OPTIONS}
                inputClassName="h-11 bg-transparent"
              />
            </div>
          </Form>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              props.onChange(toPeriod(mobileForm.getValues()));
              setSheetOpen(false);
            }}
          >
            Apply filters
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
