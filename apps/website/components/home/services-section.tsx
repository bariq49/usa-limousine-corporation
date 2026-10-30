import Image from "next/image";
import Link from "next/link";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { ServiceFeatureItem, ServicesSectionProps } from "@/types/services.types";

export default function ServicesSection(props: ServicesSectionProps) {
  const { badge, title, subtitle, image, imageAlt, services, className } = props;

  if (!services || services.length === 0 || !image) {
    return null;
  }

  return (
    <section className={cn("w-full bg-black py-16 text-white sm:py-20 lg:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className="relative min-h-96 w-full overflow-hidden rounded-md bg-neutral-900 sm:min-h-112 lg:h-full lg:min-h-0">
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            {badge ? (
              <span className="mb-3 text-xs font-semibold tracking-label text-primary uppercase sm:text-caption">
                {badge}
              </span>
            ) : null}

            <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:gap-7">
              {services.map((service: ServiceFeatureItem, index: number) => {
                const itemContent = (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-neutral-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-semibold text-white sm:text-lg">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400 sm:text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );

                if (service.href) {
                  return (
                    <Link
                      key={index}
                      href={service.href}
                      className="group transition-opacity hover:opacity-90"
                    >
                      {itemContent}
                    </Link>
                  );
                }

                return <div key={index}>{itemContent}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
