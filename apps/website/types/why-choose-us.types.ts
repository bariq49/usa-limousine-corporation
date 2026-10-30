import type { ReactNode } from "react";

export type FeatureItem = {
  icon?: ReactNode;
  title: string;
  description: string;
};

export type WhyChooseUsSectionProps = {
  variant?: "cards" | "split";
  badge?: string;
  title: ReactNode;
  subtitle?: string;
  features: FeatureItem[];
  image?: string;
  imageAlt?: string;
  className?: string;
};
