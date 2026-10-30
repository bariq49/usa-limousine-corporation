"use client";

import { Slider, SliderSlide } from "@usa-limousine-corporation/ui/components/slider";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { StatsBarProps } from "@/types/stats.types";

export default function StatsBar(props: StatsBarProps) {
  const { items, className } = props;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full border-y border-neutral-800 bg-black", className)}>
      <div className="container mx-auto px-4">
        <div className="hidden md:grid md:grid-cols-3 md:divide-x md:divide-neutral-800">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-6 py-6 first:pl-0 last:pr-0 lg:px-8 lg:py-7"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-secondary/60 text-secondary">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white lg:text-base">
                  {item.title}
                </span>
                <span className="text-xs font-normal leading-relaxed text-neutral-400">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="block py-4 md:hidden">
          <Slider
            slidesPerView={1}
            spaceBetween={16}
            navigation={false}
            pagination={false}
            autoplay={true}
            loop={true}
            className="[&_.ui-slider]:!pb-0"
          >
            {items.map((item, index) => (
              <SliderSlide key={index} className="!h-auto">
                <div className="flex w-full items-center justify-start gap-4 py-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-secondary/60 text-secondary">
                    {item.icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold tracking-tight text-white sm:text-base">
                      {item.title}
                    </span>
                    <span className="text-xs font-normal leading-relaxed text-neutral-400">
                      {item.description}
                    </span>
                  </div>
                </div>
              </SliderSlide>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
