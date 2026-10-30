import type { ReactNode } from "react";

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type HowItWorksSectionProps = {
  badge?: string;
  title: ReactNode;
  steps: HowItWorksStep[];
  className?: string;
};
