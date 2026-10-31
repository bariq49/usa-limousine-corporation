"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader } from "../card";
import { Button } from "../button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import { Form } from "../form";
import { Input } from "../input";
import { Skeleton } from "../skeleton";
import AreaChart from "../charts/area-chart";
import { SlidersHorizontal } from "../../svg";
import { cn } from "../../utils/cn";
import { formatDate } from "../../utils/date";
import { formatPrice } from "../../utils/price";

export type OverviewStatColor = "primary" | "success" | "info" | "warning" | "destructive";

export interface OverviewStat {
  key: string;
  label: string;
  color: OverviewStatColor;
  chartColor: string;
  kind: "currency" | "count";
  total: number;
  monthly: number[];
}

export type AnalyticsFilters = {
  year: number;
  month: number | null;
};

export interface AnalyticsProps {
  title: string;
  description: string;
  stats: OverviewStat[];
  year: number;
  month?: number | null | undefined;
  onFiltersChange?: ((filters: AnalyticsFilters) => void) | undefined;
  monthFilter?: boolean | undefined;
  isLoading?: boolean | undefined;
  categories?: string[] | undefined;
  chartDescription?: string | undefined;
  actions?: ReactNode;
  statsClassName?: string | undefined;
  className?: string | undefined;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CURRENT_YEAR = Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4));
const DEFAULT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

type FilterValues = {
  month: string;
  year: string;
};

function formatValue(kind: OverviewStat["kind"], value: number) {
  return kind === "currency" ? formatPrice({ price: value }) : Math.round(value).toString();
}

export function Analytics({
  title,
  description,
  stats,
  year,
  month = null,
  onFiltersChange,
  monthFilter = true,
  isLoading,
  categories = MONTHS,
  chartDescription,
  actions,
  statsClassName,
  className,
}: AnalyticsProps) {
  const [selectedKey, setSelectedKey] = useState(stats[0]?.key ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selected = stats.find((item) => item.key === selectedKey) ?? stats[0];
  const showFilters = Boolean(onFiltersChange);
  const showMonth = showFilters && monthFilter;
  const form = useForm<FilterValues>({
    defaultValues: {
      month: month ? String(month) : "all",
      year: String(year),
    },
  });
  const mobileForm = useForm<FilterValues>({
    defaultValues: {
      month: month ? String(month) : "all",
      year: String(year),
    },
  });
  const watchedMonth = useWatch({ control: form.control, name: "month" });
  const watchedYear = useWatch({ control: form.control, name: "year" });

  useEffect(() => {
    form.setValue("month", month ? String(month) : "all");
    form.setValue("year", String(year));
    mobileForm.setValue("month", month ? String(month) : "all");
    mobileForm.setValue("year", String(year));
  }, [form, mobileForm, month, year]);

  useEffect(() => {
    if (!onFiltersChange || watchedYear === undefined) return;
    const nextYear = Number(watchedYear);
    const nextMonth =
      !showMonth || watchedMonth === undefined || watchedMonth === "all"
        ? null
        : Number(watchedMonth);
    if (nextYear === year && nextMonth === month) return;
    onFiltersChange({ year: nextYear, month: nextMonth });
  }, [month, onFiltersChange, showMonth, watchedMonth, watchedYear, year]);

  const monthOptions = [{ value: "all", label: "All months" }].concat(
    MONTHS.map((option, index) => ({
      value: String(index + 1),
      label: option,
    })),
  );
  const yearOptions = DEFAULT_YEARS.map((option) => ({
    value: String(option),
    label: String(option),
  }));

  return (
    <Card
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-md border-none bg-transparent shadow-none md:border md:border-border/60 md:bg-card",
        className,
      )}
    >
      <CardHeader className="gap-3 border-none px-0 pb-3 pt-0 md:flex-row md:items-start md:justify-between md:border-b md:border-border/50 md:px-5 md:pb-4 md:pt-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="text-lg font-semibold text-default-900 md:text-xl">{title}</div>
            <span className="block text-xs text-default-500 md:text-sm">{description}</span>
          </div>
          {showFilters ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0 md:hidden"
              aria-label="Open analytics filters"
              onClick={() => {
                mobileForm.setValue("month", month ? String(month) : "all");
                mobileForm.setValue("year", String(year));
                setFiltersOpen(true);
              }}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        {showFilters ? (
          <Form {...form}>
            <div
              className={cn(
                "hidden gap-2 md:flex md:shrink-0",
                showMonth ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {showMonth ? (
                <Input
                  name="month"
                  type="select"
                  options={monthOptions}
                  className="md:w-32"
                  inputClassName="h-10 bg-transparent md:h-9"
                />
              ) : null}
              <Input
                name="year"
                type="select"
                options={yearOptions}
                className="md:w-24"
                inputClassName="h-10 bg-transparent md:h-9"
              />
            </div>
          </Form>
        ) : (
          actions
        )}
      </CardHeader>
      {showFilters ? (
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent className="max-w-md gap-5 max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:overflow-y-auto max-md:rounded-t-2xl max-md:rounded-b-none max-md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <DialogHeader className="text-left">
              <DialogTitle>Analytics filters</DialogTitle>
              <DialogDescription>
                Choose a month and year to update your analytics.
              </DialogDescription>
            </DialogHeader>
            <Form {...mobileForm}>
              <div className="grid gap-4">
                {showMonth ? (
                  <Input
                    name="month"
                    label="Month"
                    type="select"
                    options={monthOptions}
                    inputClassName="h-11 bg-transparent"
                  />
                ) : null}
                <Input
                  name="year"
                  label="Year"
                  type="select"
                  options={yearOptions}
                  inputClassName="h-11 bg-transparent"
                />
              </div>
            </Form>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                const values = mobileForm.getValues();
                onFiltersChange?.({
                  year: Number(values.year),
                  month: showMonth && values.month !== "all" ? Number(values.month) : null,
                });
                setFiltersOpen(false);
              }}
            >
              Apply filters
            </Button>
          </DialogContent>
        </Dialog>
      ) : null}
      <CardContent className="flex flex-1 flex-col gap-5 px-0 py-3 md:gap-6 md:p-5">
        <div
          className={cn(
            "grid grid-cols-2 items-stretch gap-2 sm:gap-3",
            {
              "lg:grid-cols-3": stats.length <= 3,
              "lg:grid-cols-4": stats.length === 4,
              "lg:grid-cols-5": stats.length === 5,
              "lg:grid-cols-6": stats.length >= 6,
            },
            statsClassName,
          )}
        >
          {stats.map((item) => (
            <button
              type="button"
              key={item.key}
              aria-pressed={selected?.key === item.key}
              onClick={() => setSelectedKey(item.key)}
              className={cn(
                "relative flex h-full min-h-24 w-full cursor-pointer flex-col items-start justify-between gap-1 overflow-hidden rounded-md border-none p-3.5 text-left transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none md:min-h-28 md:gap-1.5 md:p-4",
                {
                  "bg-primary/20": item.color === "primary",
                  "bg-warning/20": item.color === "warning",
                  "bg-success/20": item.color === "success",
                  "bg-info/20": item.color === "info",
                  "bg-destructive/15": item.color === "destructive",
                  "ring-2 ring-inset ring-primary": selected?.key === item.key,
                },
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full md:-top-8 md:-right-8 md:h-20 md:w-20",
                  {
                    "bg-primary/40": item.color === "primary",
                    "bg-warning/40": item.color === "warning",
                    "bg-success/40": item.color === "success",
                    "bg-info/40": item.color === "info",
                    "bg-destructive/30": item.color === "destructive",
                  },
                )}
              />
              <span className="relative z-10 pr-6 text-xs font-semibold capitalize text-default-700 md:pr-0 md:text-sm md:text-default-800">
                {item.label}
              </span>
              {isLoading ? (
                <Skeleton className="relative z-10 h-7 w-20" />
              ) : (
                <span className="relative z-10 text-xl font-bold text-default-900 md:text-lg md:font-semibold">
                  {formatValue(item.kind, item.total)}
                </span>
              )}
            </button>
          ))}
        </div>
        {selected ? (
          <div className="flex flex-1 flex-col border-t border-border/50 pt-5">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-default-900">
                {selected.label} Overview
              </h3>
              <p className="text-xs text-default-500">
                {chartDescription ??
                  (selected.kind === "currency"
                    ? `${month ? "Daily" : "Monthly"} amount from completed bookings in ${month ? `${MONTHS[month - 1]} ` : ""}${year}`
                    : `${month ? "Daily" : "Monthly"} booking count in ${month ? `${MONTHS[month - 1]} ` : ""}${year}`)}
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-64 w-full md:h-72" />
            ) : (
              <div className="min-w-0">
                <AreaChart
                  series={[{ name: selected.label, data: selected.monthly }]}
                  chartColor={selected.chartColor}
                  height={260}
                  categories={categories}
                  formatYAxisValue={(value) =>
                    selected.kind === "currency"
                      ? `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
                      : String(Math.round(value))
                  }
                  formatTooltipTitle={(category) =>
                    month ? `${MONTHS[month - 1]} ${category}, ${year}` : `${category} ${year}`
                  }
                  formatTooltipValue={(value) => formatValue(selected.kind, value)}
                />
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
