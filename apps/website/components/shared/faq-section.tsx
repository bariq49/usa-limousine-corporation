"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { luxuryEase } from "@/components/animations";
import type { FaqSectionProps } from "@/types/faq.types";

export default function FaqSection(props: FaqSectionProps) {
  const { subtitle, title, description, items, className } = props;
  const [openIndex, setOpenIndex] = useState(0);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full bg-neutral-50 py-16 sm:py-20 lg:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              {subtitle ? (
                <span className="mb-3 block text-xs font-semibold tracking-widest text-secondary uppercase sm:text-sm">
                  {subtitle}
                </span>
              ) : null}
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                {title}
                <span className="text-primary">.</span>
              </h2>
              {description ? (
                <p className="mt-6 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {description}
                </p>
              ) : null}
              <span className="mt-8 block h-1 w-12 rounded-full bg-primary/30" />
            </div>
          </div>

          <div className="space-y-3 lg:col-span-8">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className={cn(
                    "rounded-md border bg-white transition-shadow duration-300",
                    isOpen ? "border-primary/30 shadow-md" : "border-border hover:shadow-sm",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left sm:px-6"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-300 sm:text-base",
                        isOpen ? "text-primary" : "text-black",
                      )}
                    >
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                        isOpen
                          ? "rotate-180 bg-primary text-white"
                          : "bg-neutral-100 text-neutral-500",
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: luxuryEase }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600 sm:px-6">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
