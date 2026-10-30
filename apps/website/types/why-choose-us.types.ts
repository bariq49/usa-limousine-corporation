import type { ReactNode } from "react";

export type FeatureItem = {
  icon: ReactNode;
  title: string;
  description: string;
};

export type WhyChooseUsSectionProps = {
  badge?: string;
  title: string;
  subtitle?: string;
  features: FeatureItem[];
  className?: string;
};
