"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";
import { theme } from "../../lib/themes";
import { useMediaQuery } from "../../hooks/use-media-query";
import { getGridConfig, getXAxisConfig, getYAxisConfig } from "../../lib/apexcharts-options";
import { chartTickAmount, shouldTrimChartLabels } from "../../lib/chart-axis";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface LineChartProps {
  series: ApexAxisChartSeries;
  colors: string[];
  height?: number;
  categories?: string[];
  formatYAxisValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  formatTooltipTitle?: (category: string) => string;
}

const LineChart = (props: LineChartProps) => {
  const {
    series,
    colors,
    height = 300,
    categories,
    formatYAxisValue,
    formatTooltipValue,
    formatTooltipTitle,
  } = props;
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const isTablet = !useMediaQuery("(min-width: 1024px)");
  const chartHeight = isMobile
    ? Math.min(height, 220)
    : isTablet
      ? Math.min(height, 260)
      : height;
  const { theme: mode } = useTheme();
  const currentTheme = theme[mode === "dark" ? "dark" : "light"];
  const chartLabelColor = `hsl(${currentTheme.chartLabel})`;
  const yAxisConfig = getYAxisConfig(chartLabelColor);
  const grid = getGridConfig(`hsl(${currentTheme.chartGrid})`);
  const xAxis = getXAxisConfig(chartLabelColor);

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: isMobile ? 2.5 : 3,
    },
    markers: {
      size: isMobile ? 0 : 4,
      hover: { size: 6 },
      strokeWidth: 2,
      strokeColors: "#ffffff",
    },
    colors,
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      shared: true,
      intersect: false,
      x: {
        formatter: (value: number | string) => formatTooltipTitle?.(String(value)) ?? String(value),
      },
      y: {
        formatter: (value: number) => formatTooltipValue?.(value) ?? String(Math.round(value)),
      },
    },
    grid: Object.assign({}, grid),
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: { colors: chartLabelColor },
      markers: { size: 6 },
      fontSize: isMobile ? "11px" : "12px",
      itemMargin: { horizontal: isMobile ? 8 : 12, vertical: 4 },
    },
    yaxis: Object.assign({}, yAxisConfig, {
      min: 0,
      forceNiceScale: true,
      labels: Object.assign({}, yAxisConfig.labels, {
        offsetX: isMobile ? -6 : -10,
        style: {
          colors: chartLabelColor,
          fontSize: isMobile ? "10px" : "12px",
          fontFamily: "inherit",
        },
        formatter: (value: number) => formatYAxisValue?.(value) ?? String(Math.round(value)),
      }),
    }),
    xaxis: Object.assign({}, xAxis, {
      categories,
      tickPlacement: "on",
      tickAmount: chartTickAmount(categories?.length ?? 12, isMobile, isTablet),
      labels: {
        rotate: 0,
        hideOverlappingLabels: shouldTrimChartLabels(categories?.length ?? 0),
        trim: shouldTrimChartLabels(categories?.length ?? 0),
        showDuplicates: false,
        style: {
          colors: chartLabelColor,
          fontSize: isMobile ? "10px" : "12px",
          fontFamily: "inherit",
        },
      },
      tooltip: { enabled: false },
    }),
  };

  return (
    <div className="min-w-0 w-full">
      <Chart options={options} series={series} type="line" height={chartHeight} width="100%" />
    </div>
  );
};

export default LineChart;
