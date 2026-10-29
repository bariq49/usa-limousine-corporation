"use client";

import { useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { SwiperModule } from "swiper/types";
import { ChevronLeft, ChevronRight } from "../svg";
import { cn } from "../utils/cn";
import type { SliderProps } from "../types/slider";

export type { SliderProps, SliderSlideProps } from "../types/slider";

export function Slider(props: SliderProps) {
  const {
    children,
    className,
    spaceBetween = 24,
    slidesPerView = 1,
    breakpoints,
    autoplay = true,
    navigation = true,
    pagination = true,
    loop = false,
  } = props;

  const id = useId().replace(/:/g, "");
  const prevClass = `ui-slider-prev-${id}`;
  const nextClass = `ui-slider-next-${id}`;

  const modules: SwiperModule[] = [];
  if (autoplay) modules.push(Autoplay);
  if (navigation) modules.push(Navigation);
  if (pagination) modules.push(Pagination);

  return (
    <div className={cn("ui-slider-wrap relative w-full", className)}>
      <Swiper
        modules={modules}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        breakpoints={breakpoints}
        navigation={
          navigation
            ? {
                prevEl: `.${prevClass}`,
                nextEl: `.${nextClass}`,
              }
            : false
        }
        pagination={pagination ? { clickable: true } : false}
        loop={loop}
        autoplay={
          autoplay
            ? {
                delay: typeof autoplay === "object" ? (autoplay.delay ?? 5000) : 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        className="ui-slider w-full"
      >
        {children}
      </Swiper>

      {navigation ? (
        <div className="ui-slider-nav" aria-label="Slider controls">
          <button type="button" className={cn("ui-slider-btn", prevClass)} aria-label="Previous slide">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className={cn("ui-slider-btn", nextClass)} aria-label="Next slide">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export { SwiperSlide as SliderSlide };
