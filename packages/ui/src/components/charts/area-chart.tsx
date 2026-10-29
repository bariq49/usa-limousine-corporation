"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "next-themes";
import { theme } from "../../lib/themes";
import { getGridConfig, getXAxisConfig, getYAxisConfig } from "../../lib/apexcharts-options";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";

interface AreaChartProps {
  series: ApexAxisChartSeries;
  chartColor: string;
  height?: number;
  categories?: string[];
  formatYAxisValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
}

const AreaChart = (props: AreaChartProps) => {
  const {
    series,
    chartColor,
    height = 300,
    categories,
    formatYAxisValue,
    formatTooltipValue,
  } = props;

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
      curve: "smooth",
      width: 4,
    },
    colors: [chartColor],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
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
      labels: {
        ...yAxisConfig.labels,
        formatter: (value: number) => formatYAxisValue?.(value) ?? String(Math.round(value)),
      },
    },
    xaxis: {
      ...getXAxisConfig(chartLabelColor),
      ...(categories && { categories }),
    },
  };

  return <Chart options={options} series={series} type="area" height={height} width={"100%"} />;
};

export default AreaChart;
