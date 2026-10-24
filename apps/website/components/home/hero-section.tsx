"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Step1 from "../booking/setp-1/setp-1";
import { IMAGES } from "@/constants/image-constants";
import { HeroMotion, HeroMotionItem, fadeInVariants, luxuryEase } from "@/components/animations";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-x-hidden">
      {/* Desktop full-bleed background */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
        <motion.div
          className="absolute inset-0"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.85, ease: luxuryEase }}
        >
          <Image
            src={IMAGES.HOME_BANNER}
            alt="Airport transfer and chauffeur service"
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-transparent" />
        </motion.div>
      </div>

      <div className="relative z-20">
        <div className="mx-auto grid max-w-screen-2xl gap-0 lg:grid-cols-2 lg:gap-8 lg:px-5 lg:pt-40 lg:pb-16 xl:grid-cols-3 xl:pb-20">
          {/* Mobile image ends at the form; desktop uses full-bleed bg above */}
          <div className="relative order-1 flex min-h-vh-58 w-full flex-col items-center justify-end overflow-hidden pt-safe-hero pb-14 text-center sm:min-h-vh-54 sm:pt-safe-hero-lg sm:pb-16 lg:min-h-0 lg:items-start lg:overflow-visible lg:bg-transparent lg:pt-0 lg:pb-4 lg:text-left xl:col-span-2">
            <div className="absolute inset-0 lg:hidden">
              <Image
                src={IMAGES.HOME_BANNER_MOBILE}
                alt="Airport transfer and chauffeur service"
                fill
                sizes="100vw"
                className="scale-105 object-cover object-hero"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/25" />
            </div>

            <HeroMotion className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-5 px-4 text-center sm:px-5 lg:items-start lg:text-left">
              <HeroMotionItem>
                <div className="flex items-center justify-center gap-2.5 lg:justify-start">
                  <span className="h-0.5 w-6 bg-secondary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary sm:text-sm">
                    SERVING JFK · LGA · EWR · TEB
                  </span>
                </div>
              </HeroMotionItem>

              <HeroMotionItem>
                <h1 className="text-4xl font-extrabold leading-heading tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Premier Luxury
                  <br />
                  <span className="text-secondary">Transportation</span>
                </h1>
              </HeroMotionItem>

              <HeroMotionItem>
                <p className="mx-auto max-w-xl text-sm font-normal leading-relaxed text-slate-200 sm:text-base md:text-lg lg:mx-0">
                  Proudly Serving New Jersey, New York City &amp; the Tri-State Area
                </p>
              </HeroMotionItem>
            </HeroMotion>
          </div>

          <div
            id="hero-booking"
            className="order-2 relative z-10 -mt-6 flex w-full scroll-mt-24 items-center justify-center lg:mt-0 lg:items-start lg:justify-end lg:pr-2 lg:pt-6 xl:pr-4 xl:pt-10"
          >
            <motion.div
              className="w-full max-w-md rounded-t-md bg-white shadow-sheet-strong lg:rounded-none lg:bg-transparent lg:shadow-none"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: luxuryEase }}
            >
              <Step1 />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
