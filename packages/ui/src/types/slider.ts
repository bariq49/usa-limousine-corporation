import type { ReactNode } from "react";
import type { SwiperOptions } from "swiper/types";

export type SliderProps = {
  children: ReactNode;
  className?: string;
  spaceBetween?: number;
  slidesPerView?: number | "auto";
  breakpoints?: SwiperOptions["breakpoints"];
  autoplay?: boolean | { delay?: number };
  navigation?: boolean;
  pagination?: boolean;
  loop?: boolean;
  centeredSlides?: boolean;
};

export type SliderSlideProps = {
  children: ReactNode;
  className?: string;
};
