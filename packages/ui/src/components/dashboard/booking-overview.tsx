"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader } from "../card";
import { Form } from "../form";
import { Input } from "../input";
import { Skeleton } from "../skeleton";
import AreaChart from "../charts/area-chart";
import { cn } from "../../utils/cn";
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

export interface BookingOverviewProps {
  title: string;
  description: string;
  stats: OverviewStat[];
  year: number;
  years?: number[] | undefined;
  onYearChange?: ((year: number) => void) | undefined;
  month?: number | null | undefined;
  onMonthChange?: ((month: number | null) => void) | undefined;
  isLoading?: boolean | undefined;
  categories?: string[] | undefined;
  chartDescription?: string | undefined;
  actions?: ReactNode;
  statsClassName?: string | undefined;
  className?: string | undefined;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type FilterValues = {
  month: string;
  year: string;
};

function formatValue(kind: OverviewStat["kind"], value: number) {
  return kind === "currency" ? formatPrice({ price: value }) : Math.round(value).toString();
}

export function BookingOverview({
  title,
  description,
  stats,
  year,
  years,
  onYearChange,
  month,
  onMonthChange,
  isLoading,
  categories = MONTHS,
  chartDescription,
  actions,
  statsClassName,
  className,
}: BookingOverviewProps) {
  const [selectedKey, setSelectedKey] = useState(stats[0]?.key ?? "");
  const selected = stats.find((item) => item.key === selectedKey) ?? stats[0];
  const form = useForm<FilterValues>({
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
  }, [form, month, year]);

  useEffect(() => {
    if (!onMonthChange || watchedMonth === undefined) return;
    const next = watchedMonth === "all" ? null : Number(watchedMonth);
    if (next !== month) onMonthChange(next);
  }, [month, onMonthChange, watchedMonth]);

  useEffect(() => {
    if (!onYearChange || watchedYear === undefined) return;
    const next = Number(watchedYear);
    if (next !== year) onYearChange(next);
  }, [onYearChange, watchedYear, year]);

  const monthOptions = [{ value: "all", label: "All months" }].concat(
    MONTHS.map((option, index) => ({
      value: String(index + 1),
      label: option,
    })),
  );
  const yearOptions = (years ?? []).map((option) => ({
    value: String(option),
    label: String(option),
  }));

  return (
    <Card
      className={cn(
        "flex h-full flex-col max-md:border-none max-md:bg-transparent max-md:shadow-none",
        className,
      )}
    >
      <CardHeader className="gap-3 border-none pb-0 max-md:px-0 max-md:pt-0 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="text-xl font-semibold text-default-900">{title}</div>
          <span className="block text-xs text-default-600 md:text-sm">{description}</span>
        </div>
        {years && onYearChange ? (
          <Form {...form}>
            <div
              className={cn(
                "grid gap-2 md:flex md:shrink-0",
                onMonthChange ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {onMonthChange ? (
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
      <CardContent className="flex flex-1 flex-col px-0 py-4 md:p-5">
        <div
          className={cn(
            "grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:gap-6",
            {
              "lg:grid-cols-4": stats.length === 4,
              "lg:grid-cols-5": stats.length >= 5,
              "lg:grid-cols-3": stats.length <= 3,
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
                "relative flex h-full min-h-24 w-full cursor-pointer flex-col items-start justify-between gap-1 overflow-hidden rounded-md p-3.5 text-left md:min-h-28 md:gap-1.5 md:p-4 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                {
                  "bg-primary/30": item.color === "primary",
                  "bg-warning/30": item.color === "warning",
                  "bg-success/30": item.color === "success",
                  "bg-info/30": item.color === "info",
                  "bg-destructive/20": item.color === "destructive",
                  "ring-2 ring-inset ring-primary": selected?.key === item.key,
                },
              )}
            >
              <span
                className={cn(
                  "absolute -top-3 -right-3 h-8 w-8 rounded-full ring-6 md:h-10 md:w-10 md:ring-8",
                  {
                    "bg-primary/50 ring-primary/20": item.color === "primary",
                    "bg-amber-200 ring-amber-100": item.color === "warning",
                    "bg-green-200 ring-green-100": item.color === "success",
                    "bg-cyan-200 ring-cyan-100": item.color === "info",
                    "bg-red-200 ring-red-100": item.color === "destructive",
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
          <div className="mt-6 flex flex-1 flex-col md:px-3">
            <div className="mb-4">
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
              <div className="min-w-0 overflow-x-auto">
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
