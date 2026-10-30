"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { AirportItem, AirportsSectionProps } from "@/types/airport.types";

export default function AirportsSection(props: AirportsSectionProps) {
  const { badge, title, subtitle, airports, autoplay = true, loop = true, className } = props;
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  if (!airports || airports.length === 0) {
    return null;
  }

  const displayAirports = loop && airports.length < 10 ? airports.concat(airports) : airports;

  const autoplayConfig = autoplay
    ? {
      delay: typeof autoplay === "object" && autoplay.delay ? autoplay.delay : 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    }
    : false;

  const handlePrev = () => {
    swiperInstance?.slidePrev();
  };

  const handleNext = () => {
    swiperInstance?.slideNext();
  };

  return (
    <section
      className={cn(
        "w-full overflow-hidden bg-black py-16 text-white sm:py-20 lg:py-24",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col">
            {badge ? (
              <span className="mb-3 text-xs font-semibold tracking-label text-primary uppercase sm:text-caption">
                {badge}
              </span>
            ) : null}
            <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous airport"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all hover:border-white/40 hover:bg-white/10 active:scale-95 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next airport"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all hover:border-white/40 hover:bg-white/10 active:scale-95 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 lg:mt-14">
          <Swiper
            modules={[Autoplay]}
            loop={loop}
            autoplay={autoplayConfig}
            onSwiper={setSwiperInstance}
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="w-full"
          >
            {displayAirports.map((airport: AirportItem, index: number) => {
              const cardContent = (
                <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-md bg-neutral-900">
                  <Image
                    src={airport.image}
                    alt={airport.name}
                    fill
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute inset-x-4 bottom-6 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-medium tracking-tight text-white drop-shadow-md sm:text-xl">
                      {airport.name}
                    </h3>
                    {airport.description ? (
                      <p className="mt-1 text-xs text-neutral-300">{airport.description}</p>
                    ) : null}
                  </div>
                </div>
              );

              return (
                <SwiperSlide key={index}>
                  {airport.href ? (
                    <Link href={airport.href} className="block w-full">
                      {cardContent}
                    </Link>
                  ) : (
                    cardContent
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
