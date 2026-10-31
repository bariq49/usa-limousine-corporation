"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import { theme } from "../../lib/themes";
import { useMediaQuery } from "../../hooks/use-media-query";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DonutChartProps {
  series: number[];
  labels: string[];
  colors: string[];
  height?: number;
  formatTooltipValue?: (value: number) => string;
}

const DonutChart = (props: DonutChartProps) => {
  const { series, labels, colors, height = 300, formatTooltipValue } = props;
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const isTablet = !useMediaQuery("(min-width: 1024px)");
  const chartHeight = isMobile
    ? Math.min(height, 240)
    : isTablet
      ? Math.min(height, 260)
      : height;
  const { theme: mode } = useTheme();
  const currentTheme = theme[mode === "dark" ? "dark" : "light"];
  const chartLabelColor = `hsl(${currentTheme.chartLabel})`;

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      parentHeightOffset: 0,
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    labels,
    colors,
    dataLabels: {
      enabled: !isMobile,
      style: {
        fontSize: isMobile ? "10px" : "12px",
        fontFamily: "inherit",
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: { colors: chartLabelColor },
      fontFamily: "inherit",
      fontSize: isMobile ? "11px" : "12px",
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    stroke: {
      show: false,
      width: 0,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "13px",
              fontFamily: "inherit",
              color: chartLabelColor,
            },
            value: {
              show: true,
              fontSize: isMobile ? "18px" : "22px",
              fontFamily: "inherit",
              fontWeight: 600,
              color: chartLabelColor,
              formatter: (value: string) =>
                formatTooltipValue?.(Number(value)) ?? String(Math.round(Number(value))),
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              fontFamily: "inherit",
              color: chartLabelColor,
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce(
                  (sum: number, item: number) => sum + item,
                  0,
                );
                return formatTooltipValue?.(total) ?? String(Math.round(total));
              },
            },
          },
        },
      },
    },
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      y: {
        formatter: (value: number) => formatTooltipValue?.(value) ?? String(Math.round(value)),
      },
    },
  };

  return (
    <div className="min-w-0 w-full overflow-hidden">
      <Chart options={options} series={series} type="donut" height={chartHeight} width="100%" />
    </div>
  );
};

export default DonutChart;
