import Link from "next/link";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { CtaSectionProps } from "@/types/cta.types";

export default function CtaSection(props: CtaSectionProps) {
  const {
    badge,
    title,
    subtitle,
    features,
    backgroundImage,
    primaryButton,
    secondaryButton,
    className,
  } = props;

  if (!title || !backgroundImage) {
    return null;
  }

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-black py-20 sm:py-28 lg:py-36", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/75 sm:bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {badge ? (
            <span className="mb-4 text-xs font-semibold tracking-label text-primary uppercase sm:text-caption">
              {badge}
            </span>
          ) : null}

          <h2 className="text-3xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-4 text-sm font-normal text-neutral-300 sm:text-base">{subtitle}</p>
          ) : null}

          {features && features.length > 0 ? (
            <div className="my-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-2xs tracking-widest text-neutral-300 uppercase sm:my-10 sm:gap-x-6 sm:text-xs">
              {features.map((feature, index) => (
                <span key={index} className="flex items-center gap-4 sm:gap-6">
                  <span className="text-neutral-500">—</span>
                  <span>{feature}</span>
                  {index === features.length - 1 ? (
                    <span className="text-neutral-500">—</span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-2 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-6">
            {primaryButton ? (
              <Link
                href={primaryButton.href || "#"}
                className="inline-flex w-full items-center justify-center rounded-md bg-cream-100 px-8 py-3.5 text-xs font-semibold tracking-wider text-neutral-900 uppercase transition hover:bg-white sm:w-auto sm:text-sm"
              >
                {primaryButton.label}
              </Link>
            ) : null}

            {secondaryButton ? (
              <Link
                href={secondaryButton.href || "#"}
                className="inline-flex w-full items-center justify-center rounded-md border border-white/40 bg-black/40 px-8 py-3.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-xs transition hover:border-white hover:bg-white/10 sm:w-auto sm:text-sm"
              >
                {secondaryButton.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
