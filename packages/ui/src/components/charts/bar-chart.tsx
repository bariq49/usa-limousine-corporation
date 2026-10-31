"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery } from "../../hooks/use-media-query";
import type { ChartAxisFormatters, ChartSeries } from "../../types/charts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";

export type BarChartSeries = ChartSeries;

interface BarChartProps extends ChartAxisFormatters {
  series: ChartSeries[];
  colors: string[];
  height?: number;
  categories?: string[];
  stacked?: boolean;
  distributed?: boolean;
}

function seriesKey(name: string, index: number) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `series-${index}`;
}

function responsiveHeight(height: number, isMobile: boolean, isTablet: boolean) {
  if (isMobile) return Math.min(height, 220);
  if (isTablet) return Math.min(height, 260);
  return height;
}

const BarChart = (props: BarChartProps) => {
  const {
    series,
    colors,
    height = 300,
    categories = [],
    stacked = false,
    distributed = false,
    formatYAxisValue,
    formatTooltipValue,
    formatTooltipTitle,
  } = props;
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const isTablet = !useMediaQuery("(min-width: 1024px)");
  const chartHeight = responsiveHeight(height, isMobile, isTablet);

  const keys = series.map((item, index) => seriesKey(item.name, index));

  const config: ChartConfig = {};
  series.forEach((item, index) => {
    config[keys[index] as string] = {
      label: item.name,
      color: colors[index] || colors[0] || "#8b5cf6",
    };
  });

  const data = categories.map((label, index) => {
    const row: Record<string, string | number> = { label };
    series.forEach((item, seriesIndex) => {
      const key = keys[seriesIndex] as string;
      row[key] = item.data[index] ?? 0;
      if (distributed && series.length === 1) {
        row.fill = colors[index] || colors[0] || "#8b5cf6";
      }
    });
    return row;
  });

  const showLegend = !distributed && series.length > 1;

  const showAllTicks = categories.length > 0 && categories.length <= 12;

  return (
    <div className="min-w-0 w-full">
      <ChartContainer
        config={config}
        className="aspect-auto w-full min-w-0"
        style={{ height: chartHeight, width: "100%" }}
      >
        <RechartsBarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 8,
            right: isMobile ? 4 : 12,
            left: isMobile ? -8 : 4,
            bottom: showLegend ? 4 : 0,
          }}
          barCategoryGap={isMobile ? "18%" : showAllTicks ? "28%" : "22%"}
          barGap={stacked ? 0 : 4}
        >
          <CartesianGrid vertical={false} stroke="var(--muted)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={showAllTicks ? 0 : "preserveStartEnd"}
            minTickGap={showAllTicks ? 0 : isMobile ? 28 : 16}
            tickFormatter={(value: string) => {
              if (typeof value !== "string") return String(value);
              if (showAllTicks) return value;
              if (isMobile && value.length > 7) return value.slice(0, 7);
              return value;
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={isMobile ? 28 : isTablet ? 36 : 48}
            tickFormatter={(value: number) =>
              formatYAxisValue?.(value) ?? String(Math.round(value))
            }
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
            content={
              <ChartTooltipContent
                indicator={stacked ? "line" : "dot"}
                labelFormatter={(value) =>
                  formatTooltipTitle?.(String(value)) ?? String(value)
                }
                formatter={(value, name, item, index) => {
                  const numeric = typeof value === "number" ? value : Number(value);
                  const display = Number.isFinite(numeric)
                    ? formatTooltipValue?.(numeric) ?? String(Math.round(numeric))
                    : String(value);
                  const itemColor =
                    typeof item === "object" && item && "color" in item
                      ? String((item as { color?: string }).color || "")
                      : "";
                  return (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{
                          backgroundColor: itemColor || colors[index] || colors[0],
                        }}
                      />
                      <div className="flex flex-1 items-center justify-between gap-3 leading-none">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {display}
                        </span>
                      </div>
                    </>
                  );
                }}
              />
            }
          />
          {showLegend ? <ChartLegend content={<ChartLegendContent />} /> : null}
          {series.map((item, index) => {
            const key = keys[index] as string;
            const fill = `var(--color-${key})`;
            if (distributed && series.length === 1) {
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  name={item.name}
                  radius={6}
                  maxBarSize={isMobile ? 22 : isTablet ? 30 : 40}
                >
                  {data.map((row, cellIndex) => (
                    <Cell
                      key={`${key}-${cellIndex}`}
                      fill={String(row.fill || colors[cellIndex] || colors[0] || "#8b5cf6")}
                    />
                  ))}
                </Bar>
              );
            }
            const isTopStack = stacked && index === series.length - 1;
            return (
              <Bar
                key={key}
                dataKey={key}
                name={item.name}
                fill={fill}
                radius={stacked ? (isTopStack ? [4, 4, 0, 0] : 0) : 6}
                stackId={stacked ? "stack" : undefined}
                maxBarSize={isMobile ? 22 : isTablet ? 30 : stacked ? 36 : 40}
              />
            );
          })}
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
};

export default BarChart;
