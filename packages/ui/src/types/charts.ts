export type ChartSeries = {
  name: string;
  data: number[];
};

export type ChartKind = "area" | "bar" | "line" | "donut";

export type ChartAxisFormatters = {
  formatYAxisValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  formatTooltipTitle?: (category: string) => string;
};
