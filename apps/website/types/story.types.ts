import type { ReactNode } from "react";

export type StorySectionProps = {
  subtitle?: string;
  title: ReactNode;
  paragraphs: string[];
  image: string;
  imageAlt?: string;
  className?: string;
};
