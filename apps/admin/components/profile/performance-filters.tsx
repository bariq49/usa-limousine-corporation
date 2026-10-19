"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Filter, RotateCcw } from "lucide-react";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import {
  ALL_MONTH,
  AUTO_GROUP,
  defaults,
  groupOptionsForMode,
  schema,
  toQuery,
  type Mode,
  type Values,
} from "@/lib/schemas/performance-filters";
import type { Params } from "@/lib/types/drivers";

type Props = {
  onApply: (query: Params) => void;
  defaultValues?: Values;
  isApplying?: boolean;
};

const MODES: { value: Mode; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
  { value: "range", label: "Range" },
];

const MONTH_OPTIONS = [
  { value: ALL_MONTH, label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const CONTROL_H = "h-10";
const FIELD_W = "w-full sm:w-36";
const FIELD_W_WIDE = "w-full sm:w-44";
const inputClassName = "!h-10 rounded-md 2xl:!h-10";

export function PerformanceFilters(props: Props) {
  const { onApply, defaultValues = defaults(), isApplying = false } = props;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const mode = (useWatch({
    control: form.control,
    name: "mode",
  }) ?? "year") as Mode;

  const month = (useWatch({
    control: form.control,
    name: "month",
  }) ?? ALL_MONTH) as string;

  const groupBy = useWatch({
    control: form.control,
    name: "groupBy",
  });

  const groupOptions = groupOptionsForMode(mode, month);
  const showGroupBy = groupOptions.length > 0;

  const previousMode = useRef(mode);

  useEffect(() => {
    if (previousMode.current === mode) {
      return;
    }
    previousMode.current = mode;

    if (mode !== "day") {
      form.setValue("day", "");
    }
    if (mode !== "month") {
      form.setValue("month", ALL_MONTH);
    }
    if (mode !== "range") {
      form.setValue("startDate", "");
      form.setValue("endDate", "");
    }
    if ((mode === "year" || mode === "month") && !form.getValues("year")) {
      form.setValue("year", defaults().year);
    }
    form.setValue("groupBy", AUTO_GROUP);
  }, [mode, form]);

  useEffect(() => {
    const allowed = groupOptionsForMode(mode, month).map((o) => o.value);
    if (allowed.length === 0) {
      if (groupBy !== AUTO_GROUP) {
        form.setValue("groupBy", AUTO_GROUP);
      }
      return;
    }
    if (groupBy && !allowed.includes(groupBy)) {
      form.setValue("groupBy", AUTO_GROUP);
    }
  }, [mode, month, groupBy, form]);

  const setMode = (next: Mode) => {
    form.setValue("mode", next, { shouldDirty: true });
  };

  const handleSubmit = (values: Values) => {
    onApply(toQuery(values));
  };

  const handleReset = () => {
    const next = defaults();
    previousMode.current = next.mode;
    form.reset(next);
    onApply(toQuery(next));
  };

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Filter className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-base font-semibold leading-tight text-default-900">
            Performance Filters
          </h3>
          <p className="text-sm leading-snug text-default-500">
            Customize the date range to view your ride performance.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="w-full overflow-x-auto sm:w-auto">
                <div
                  role="tablist"
                  aria-label="Filter period"
                  className={cn(
                    "inline-flex w-full min-w-max items-center gap-0.5 rounded-md border border-default-300 bg-default-50 p-1 sm:w-auto",
                    CONTROL_H,
                  )}
                >
                  {MODES.map((item) => {
                    const active = mode === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setMode(item.value)}
                        className={cn(
                          "flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium transition-colors sm:flex-none sm:px-3.5",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-default-600 hover:bg-card hover:text-default-900",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {mode === "year" || mode === "month" ? (
                <div className={FIELD_W}>
                  <Input
                    name="year"
                    label="Year"
                    type="number"
                    min={2000}
                    max={2100}
                    inputClassName={inputClassName}
                  />
                </div>
              ) : null}

              {mode === "month" ? (
                <div className={FIELD_W_WIDE}>
                  <Input
                    name="month"
                    label="Month"
                    type="select"
                    options={MONTH_OPTIONS}
                    inputClassName={inputClassName}
                  />
                </div>
              ) : null}

              {mode === "day" ? (
                <div className={FIELD_W_WIDE}>
                  <Input name="day" label="Day" type="date" inputClassName={inputClassName} />
                </div>
              ) : null}

              {mode === "range" ? (
                <>
                  <div className={FIELD_W_WIDE}>
                    <Input
                      name="startDate"
                      label="Start date"
                      type="date"
                      inputClassName={inputClassName}
                    />
                  </div>
                  <div className={FIELD_W_WIDE}>
                    <Input
                      name="endDate"
                      label="End date"
                      type="date"
                      inputClassName={inputClassName}
                    />
                  </div>
                </>
              ) : null}

              {showGroupBy ? (
                <div className={FIELD_W_WIDE}>
                  <Input
                    name="groupBy"
                    label="Group by"
                    type="select"
                    options={groupOptions}
                    inputClassName={inputClassName}
                  />
                </div>
              ) : null}
            </div>

            <div
              className={cn(
                "flex w-full shrink-0 items-center justify-end gap-2 lg:ml-auto lg:w-auto",
                CONTROL_H,
              )}
            >
              <Button
                type="button"
                variant="outline"
                className={cn("gap-2 rounded-md", CONTROL_H)}
                onClick={handleReset}
                disabled={isApplying}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                className={cn("gap-2 rounded-md", CONTROL_H)}
                isLoading={isApplying}
                loadingText="Applying…"
              >
                {!isApplying ? <Check className="h-4 w-4" /> : null}
                Apply
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
