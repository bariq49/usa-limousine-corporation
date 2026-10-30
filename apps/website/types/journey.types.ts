import type { ReactNode } from "react";

export type JourneyMilestone = {
  year: string;
  title: string;
  description: string;
};

export type JourneySectionProps = {
  subtitle?: string;
  title: ReactNode;
  milestones: JourneyMilestone[];
  image: string;
  imageAlt?: string;
  className?: string;
};
