import type { ReactNode } from "react";

export type CtaButton = {
  label: string;
  href: string;
  variant?: "primary" | "outline";
};

export type CtaSectionProps = {
  badge?: string;
  title: ReactNode;
  subtitle?: string;
  features?: string[];
  backgroundImage: string;
  primaryButton?: CtaButton;
  secondaryButton?: CtaButton;
  className?: string;
};
