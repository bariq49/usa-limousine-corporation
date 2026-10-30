import Image from "next/image";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { FeatureItem, WhyChooseUsSectionProps } from "@/types/why-choose-us.types";

export default function WhyChooseUsSection(props: WhyChooseUsSectionProps) {
  const {
    variant = "cards",
    badge,
    title,
    subtitle,
    features,
    image,
    imageAlt = "Why choose us",
    className,
  } = props;

  if (!features || features.length === 0) {
    return null;
  }

  if (variant === "split") {
    return (
      <section className={cn("w-full bg-black py-16 sm:py-20 lg:py-24", className)}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-20">
            {image ? (
              <div className="relative h-80 w-full overflow-hidden rounded-md sm:h-96 lg:h-auto">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-col">
              {badge ? (
                <span className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase sm:text-sm">
                  {badge}
                </span>
              ) : null}
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-5 text-sm leading-relaxed text-neutral-400 sm:text-base">
                  {subtitle}
                </p>
              ) : null}

              <ul className="mt-8 space-y-6">
                {features.map((feature: FeatureItem) => (
                  <li key={feature.title} className="flex gap-4">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-neutral-400 sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
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
