import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { FeatureItem, WhyChooseUsSectionProps } from "@/types/why-choose-us.types";

export default function WhyChooseUsSection(props: WhyChooseUsSectionProps) {
  const { badge, title, subtitle, features, className } = props;

  if (!features || features.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full bg-cream-100 py-16 sm:py-20 lg:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {badge ? (
            <span className="mb-3 text-xs font-semibold tracking-label text-primary uppercase sm:text-caption">
              {badge}
            </span>
          ) : null}
          <h2 className="text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">{subtitle}</p>
          ) : null}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-4">
          {features.map((feature: FeatureItem, index: number) => (
            <div
              key={index}
              className="flex flex-col rounded-md border border-neutral-300 bg-cream-50 p-6 sm:p-7 lg:p-8"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md border border-primary/50 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
