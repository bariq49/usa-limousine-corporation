"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, useInView } from "framer-motion";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { MetricItem, TrustSectionProps } from "@/types/trust.types";

type MetricCounterProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

function MetricCounter(props: MetricCounterProps) {
  const { value, decimals = 0, prefix = "", suffix = "" } = props;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState(decimals > 0 ? (0).toFixed(decimals) : "0");

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        setDisplayValue(latest.toFixed(decimals));
      },
    });

    return () => controls.stop();
  }, [isInView, value, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

export default function TrustSection(props: TrustSectionProps) {
  const { title, metrics, backgroundImage, className } = props;

  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24", className)}
    >
      <div className="container relative mx-auto px-4">
        <div className="relative mx-auto flex min-h-96 w-full flex-col items-center justify-center py-10 sm:min-h-112 sm:py-16 lg:min-h-128 lg:py-20">
          {backgroundImage ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Image
                src={backgroundImage}
                alt="World map"
                fill
                sizes="100vw"
                className="object-contain opacity-35"
              />
            </div>
          ) : null}

          <div className="relative z-10 w-full">
            {title ? (
              <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
                {title}
              </h2>
            ) : null}

            <div className="mt-12 grid w-full grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-3 sm:gap-12">
              {metrics.map((item: MetricItem, index: number) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <span className="text-4xl font-bold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                    <MetricCounter
                      value={item.value}
                      decimals={item.decimals}
                      prefix={item.prefix}
                      suffix={item.suffix}
                    />
                  </span>
                  <span className="mt-2 text-xs font-normal text-neutral-600 sm:text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
