import type { ReactNode } from "react";

export type PageBannerButton = {
  text: string;
  href?: string;
  onClick?: () => void;
};

export type PageBannerSecondaryButton = {
  text: string;
  href: string;
};

export type PageBannerProps = {
  image?: string;
  imageAlt?: string;
  variant?: "default" | "centered";
  topText?: string | ReactNode;
  highlightTopText?: boolean;
  title?: string | ReactNode;
  titleClassName?: string;
  overlayClassName?: string;
  description?: string;
  footnote?: string;
  showBookingForm?: boolean;
  button?: PageBannerButton;
  secondaryButton?: PageBannerSecondaryButton;
  className?: string;
};
