export type MetricItem = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export type TrustSectionProps = {
  title: string;
  metrics: MetricItem[];
  backgroundImage?: string;
  className?: string;
};
