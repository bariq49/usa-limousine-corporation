import Image from "next/image";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { PartnerSectionProps } from "@/types/partner.types";

export default function PartnerSection(props: PartnerSectionProps) {
  const { title, partners, className, speed = 30 } = props;

  if (!partners || partners.length === 0) {
    return null;
  }

  const sequence = partners.concat(partners, partners);
  const trackItems = sequence.concat(sequence);

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-white py-14 sm:py-18 lg:py-20", className)}
    >
      <div className="container mx-auto px-4">
        {title ? (
          <h2 className="text-center text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl md:text-3xl">
            {title}
          </h2>
        ) : null}

        <div className="relative mt-8 w-full overflow-hidden sm:mt-10 lg:mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20 lg:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20 lg:w-24" />

          <div
            className="ui-partner-marquee flex w-max items-center"
            style={{ animationDuration: `${speed}s` }}
          >
            {trackItems.map((item, index) => {
              const content = (
                <Image
                  src={item.logo}
                  alt={item.alt || item.name}
                  width={220}
                  height={80}
                  className="h-8 w-auto max-w-36 object-contain opacity-85 transition-opacity hover:opacity-100 sm:h-10 sm:max-w-44 lg:h-12 lg:max-w-52"
                />
              );

              return (
                <div
                  key={index}
                  className="mx-6 flex shrink-0 items-center justify-center sm:mx-10 lg:mx-12"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.name}
                      className="inline-flex items-center justify-center"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .ui-partner-marquee {
          animation: ui-partner-marquee linear infinite;
          will-change: transform;
        }
        @keyframes ui-partner-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}
