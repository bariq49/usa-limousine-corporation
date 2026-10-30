export type AirportItem = {
  name: string;
  image: string;
  href?: string;
  code?: string;
  description?: string;
};

export type AirportsSectionProps = {
  badge?: string;
  title: string;
  subtitle?: string;
  airports: AirportItem[];
  autoplay?: boolean | { delay?: number };
  loop?: boolean;
  className?: string;
};
