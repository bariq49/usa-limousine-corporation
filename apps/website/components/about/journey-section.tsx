"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { luxuryEase } from "@/components/animations";
import type { JourneySectionProps } from "@/types/journey.types";

const ACTIVE_LINE = "0px 0px -40% 0px";

const RING_VARIANTS = {
  idle: { opacity: 0 },
  active: { opacity: 1, transition: { duration: 0.4, ease: luxuryEase } },
};

const CORE_VARIANTS = {
  idle: { opacity: 0, scale: 0 },
  active: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: luxuryEase } },
};

const GLOW_VARIANTS = {
  idle: { opacity: 0, scale: 0.4 },
  active: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: luxuryEase } },
};

const YEAR_VARIANTS = {
  idle: { opacity: 0.5 },
  active: { opacity: 1, transition: { duration: 0.4, ease: luxuryEase } },
};

export default function JourneySection(props: JourneySectionProps) {
  const { subtitle, title, milestones, image, imageAlt = "Our journey", className } = props;
  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 60%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const observer = new ResizeObserver(() => {
      const last = list.lastElementChild as HTMLElement | null;
      setTrackHeight(last ? last.offsetTop : 0);
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  if (!title || milestones.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full bg-cream-300 py-16 sm:py-20 lg:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-20">
          <div className="relative h-80 w-full overflow-hidden rounded-md shadow-xl sm:h-96 lg:h-auto">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            {subtitle ? (
              <span className="mb-3 text-xs font-semibold tracking-widest text-secondary uppercase sm:text-sm">
                {subtitle}
              </span>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            <div className="relative mt-10">
              <span
                ref={trackRef}
                className="absolute top-3.5 left-2 w-0.5 -translate-x-1/2 rounded-full bg-neutral-300"
                style={{ height: trackHeight }}
              >
                <motion.span
                  className="absolute inset-0 origin-top rounded-full bg-primary"
                  style={{ scaleY: progress }}
                />
              </span>

              <ol ref={listRef} className="relative space-y-8 pl-10">
                {milestones.map((milestone) => (
                  <motion.li
                    key={milestone.year}
                    className="relative"
                    initial="idle"
                    whileInView="active"
                    viewport={{ once: false, margin: ACTIVE_LINE }}
                  >
                    <span className="absolute top-1.5 -left-8 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 border-neutral-400 bg-cream-300">
                      <motion.span
                        variants={GLOW_VARIANTS}
                        className="absolute -inset-2 rounded-full bg-primary/25 blur-sm"
                      />
                      <motion.span
                        variants={RING_VARIANTS}
                        className="absolute -inset-0.5 rounded-full border-2 border-primary bg-cream-300"
                      />
                      <motion.span
                        variants={CORE_VARIANTS}
                        className="relative h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    </span>
                    <motion.h3
                      variants={YEAR_VARIANTS}
                      className="text-xl leading-7 font-bold text-black"
                    >
                      {milestone.year}
                    </motion.h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 sm:text-base">
                      <span className="font-semibold text-black">{milestone.title}:</span>{" "}
                      {milestone.description}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
