"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
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
  isLoading?: boolean | undefined;
  categories?: string[] | undefined;
  chartDescription?: string | undefined;
  actions?: ReactNode;
  statsClassName?: string | undefined;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  isLoading,
  categories = MONTHS,
  chartDescription,
  actions,
  statsClassName,
}: BookingOverviewProps) {
  const [selectedKey, setSelectedKey] = useState(stats[0]?.key ?? "");
  const selected = stats.find((item) => item.key === selectedKey) ?? stats[0];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-none pb-0">
        <div>
          <div className="text-xl font-semibold whitespace-nowrap text-default-900">{title}</div>
          <span className="text-xs text-default-600">{description}</span>
        </div>
        {years && onYearChange ? (
          <Select value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
            <SelectTrigger className="h-9 w-[110px]" aria-label="Year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          actions
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-5">
        <div
          className={cn(
            "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-6",
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
                "relative flex w-full cursor-pointer flex-col items-start gap-1.5 overflow-hidden rounded-md p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                {
                  "bg-primary/30": item.color === "primary",
                  "bg-warning/30": item.color === "warning",
                  "bg-success/30": item.color === "success",
                  "bg-info/30": item.color === "info",
                  "bg-destructive/20": item.color === "destructive",
                  "ring-2 ring-primary ring-offset-2": selected?.key === item.key,
                },
              )}
            >
              <span
                className={cn("absolute -top-3 -right-3 h-10 w-10 rounded-full ring-8", {
                  "bg-primary/50 ring-primary/20": item.color === "primary",
                  "bg-amber-200 ring-amber-100": item.color === "warning",
                  "bg-green-200 ring-green-100": item.color === "success",
                  "bg-cyan-200 ring-cyan-100": item.color === "info",
                  "bg-red-200 ring-red-100": item.color === "destructive",
                })}
              />
              <span className="relative z-10 text-sm font-semibold text-default-800 capitalize">
                {item.label}
              </span>
              {isLoading ? (
                <Skeleton className="relative z-10 h-7 w-20" />
              ) : (
                <span className="relative z-10 text-lg font-semibold text-default-900">
                  {formatValue(item.kind, item.total)}
                </span>
              )}
            </button>
          ))}
        </div>
        {selected ? (
          <div className="mt-6 border-t border-border px-3 pt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-default-900">
                {selected.label} Overview
              </h3>
              <p className="text-xs text-default-500">
                {chartDescription ??
                  (selected.kind === "currency"
                    ? `Monthly amount from completed bookings in ${year}`
                    : `Monthly booking count in ${year}`)}
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <AreaChart
                series={[{ name: selected.label, data: selected.monthly }]}
                chartColor={selected.chartColor}
                height={300}
                categories={categories}
                formatYAxisValue={(value) => formatValue(selected.kind, value)}
                formatTooltipValue={(value) => formatValue(selected.kind, value)}
              />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
