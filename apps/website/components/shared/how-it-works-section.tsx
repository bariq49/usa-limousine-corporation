import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { Stagger, StaggerItem } from "@/components/animations";
import type { HowItWorksSectionProps } from "@/types/how-it-works.types";

export default function HowItWorksSection(props: HowItWorksSectionProps) {
  const { badge, title, steps, className } = props;

  if (steps.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full bg-cream-300 py-16 sm:py-20 lg:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {badge ? (
            <span className="mb-3 text-xs font-semibold tracking-widest text-secondary uppercase sm:text-sm">
              {badge}
            </span>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <span className="mt-5 block h-0.5 w-14 rounded-full bg-primary" />
        </div>

        <Stagger className="mt-12 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {steps.map((step, index) => (
            <StaggerItem
              key={step.title}
              className="relative flex flex-col items-center px-4 text-center"
            >
              {index < steps.length - 1 ? (
                <span className="absolute top-7 left-1/2 hidden h-px w-full bg-primary/40 lg:block" />
              ) : null}
              <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black text-lg font-semibold text-primary shadow-lg ring-4 ring-white">
                {index + 1}
              </span>
              <h3 className="mt-6 text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600 sm:text-base">
                {step.description}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
