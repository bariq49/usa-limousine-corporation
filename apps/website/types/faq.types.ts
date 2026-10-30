export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionProps = {
  subtitle?: string;
  title: string;
  description?: string;
  items: FaqItem[];
  className?: string;
};
