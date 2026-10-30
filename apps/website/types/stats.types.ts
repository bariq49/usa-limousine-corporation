import type { ReactNode } from "react";

export type StatItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

export type StatsBarProps = {
  items: StatItem[];
  className?: string;
};
