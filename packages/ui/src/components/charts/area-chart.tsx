"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "next-themes";
import { theme } from "../../lib/themes";
import { useMediaQuery } from "../../hooks/use-media-query";
import { getGridConfig, getXAxisConfig, getYAxisConfig } from "../../lib/apexcharts-options";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";

interface AreaChartProps {
  series: ApexAxisChartSeries;
  chartColor: string;
  height?: number;
  categories?: string[];
  formatYAxisValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  formatTooltipTitle?: (category: string) => string;
}

const AreaChart = (props: AreaChartProps) => {
  const {
    series,
    chartColor,
    height = 300,
    categories,
    formatYAxisValue,
    formatTooltipValue,
    formatTooltipTitle,
  } = props;
  const isMobile = !useMediaQuery("(min-width: 768px)");

  const { theme: mode } = useTheme();

  const currentTheme = theme[mode === "dark" ? "dark" : "light"];
  const chartLabelColor = `hsl(${currentTheme.chartLabel})`;

  const yAxisConfig = getYAxisConfig(chartLabelColor);

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "monotoneCubic",
      width: isMobile ? 2.5 : 3,
    },
    markers: {
      size: 0,
      strokeWidth: 2,
      strokeColors: "#ffffff",
      hover: { size: 5 },
    },
    colors: [chartColor],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      x: {
        formatter: (value: number | string) => formatTooltipTitle?.(String(value)) ?? String(value),
      },
      y: {
        formatter: (value: number) => formatTooltipValue?.(value) ?? String(Math.round(value)),
      },
    },
    grid: {
      ...getGridConfig(`hsl(${currentTheme.chartGrid})`),
    },
    fill: {
      type: "gradient",
      colors: [chartColor],
      gradient: {
        shadeIntensity: 0.1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [50, 100, 0],
      },
    },
    yaxis: {
      ...yAxisConfig,
      min: 0,
      forceNiceScale: true,
      labels: {
        ...yAxisConfig.labels,
        offsetX: isMobile ? -6 : -10,
        style: {
          colors: chartLabelColor,
          fontSize: isMobile ? "10px" : "12px",
          fontFamily: "inherit",
        },
        formatter: (value: number) => formatYAxisValue?.(value) ?? String(Math.round(value)),
      },
    },
    xaxis: {
      ...getXAxisConfig(chartLabelColor),
      ...(categories && { categories }),
      tickPlacement: "on",
      tickAmount: isMobile ? 6 : Math.min(categories?.length ?? 12, 16),
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        trim: false,
        style: {
          colors: chartLabelColor,
          fontSize: isMobile ? "10px" : "12px",
          fontFamily: "inherit",
        },
      },
      tooltip: { enabled: false },
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="area"
      height={isMobile ? Math.min(height, 240) : height}
      width={"100%"}
    />
  );
};

export default AreaChart;
