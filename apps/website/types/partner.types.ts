export type PartnerItem = {
  name: string;
  logo: string;
  alt?: string;
  href?: string;
};

export type PartnerSectionProps = {
  title?: string;
  partners: PartnerItem[];
  className?: string;
  speed?: number;
};
