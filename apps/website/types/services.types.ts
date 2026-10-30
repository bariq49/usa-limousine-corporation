export type ServiceFeatureItem = {
  title: string;
  description: string;
  href?: string;
};

export type ServicesSectionProps = {
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  services: ServiceFeatureItem[];
  className?: string;
};
