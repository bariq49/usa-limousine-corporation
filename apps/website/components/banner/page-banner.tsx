"use client";

import Image from "next/image";
import { IMAGES } from "@/constants/image-constants";
import React from "react";
import Link from "next/link";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import Step1 from "@/components/booking/setp-1/setp-1";
import { MoveRight } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@/lib/utils";
import type { PageBannerProps } from "@/types/page-banner.types";

export default function PageBanner(props: PageBannerProps) {
  const {
    image,
    imageAlt = "Hero image",
    variant = "default",
    topText,
    highlightTopText = false,
    title,
    description,
    button,
    secondaryButton,
    showBookingForm = false,
    className,
  } = props;

  const defaultImage = IMAGES.HOME_BANNER;

  const renderTitle = (titleContent: string | React.ReactNode) => {
    if (typeof titleContent !== "string") return titleContent;
    const parts = titleContent.split(/<br\s*\/?>/i);
    if (parts.length === 1) return titleContent;

    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (variant === "centered") {
    return (
      <section
        className={cn(
          "relative w-full min-h-60 overflow-hidden md:min-h-70 lg:min-h-100",
          className,
        )}
      >
        <div className="absolute inset-0">
          <Image
            src={image || defaultImage}
            alt={imageAlt}
            fill
            sizes="100vw"
            className={cn("h-full w-full object-cover object-center", className)}
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-20 flex min-h-inherit items-center justify-center px-4 py-20 md:py-24">
          {title ? (
            <h1 className="text-center text-4xl font-bold text-white md:text-5xl">
              {renderTitle(title)}
            </h1>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative w-full overflow-visible",
        showBookingForm ? "pt-48 pb-0" : "pt-48 pb-4",
      )}
    >
      <div className="absolute inset-0 h-full w-full">
        <div className="absolute inset-0">
          <Image
            src={image || defaultImage}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="h-full w-full object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      </div>

      <div className="relative z-20">
        <div
          className={cn(
            "mx-auto grid max-w-screen-2xl gap-6 lg:px-5",
            "max-lg:px-3 pt-16 lg:pt-32 lg:pb-32",
          )}
        >
          <div className={showBookingForm ? "max-lg:px-0" : undefined}>
            <div
              className={
                showBookingForm
                  ? "grid items-end gap-8 lg:grid-cols-hero"
                  : "flex w-full flex-col items-center justify-center gap-6 md:items-start lg:gap-8"
              }
            >
              <div
                className={cn(
                  "flex flex-col gap-3 sm:gap-4",
                  "items-center text-center md:items-start md:text-left",
                  showBookingForm && "pb-2 lg:pb-8",
                )}
              >
                {topText &&
                  (highlightTopText ? (
                    <p className="text-xs font-bold text-secondary sm:text-sm">
                      {topText}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                      <div className="hidden h-0.5 w-8 bg-secondary md:block" />
                      <span className="text-xs font-bold uppercase tracking-label text-white md:text-sm md:tracking-widest">
                        {topText}
                      </span>
                      <div className="h-0.5 w-10 bg-secondary md:hidden" />
                    </div>
                  ))}
                <h1 className="text-center text-4xl font-extrabold text-white md:text-left md:text-6xl lg:text-7xl">
                  {renderTitle(title)}
                </h1>

                {description && (
                  <p className="max-w-2xl text-center text-sm leading-relaxed text-white/75 md:text-left md:text-base lg:text-lg">
                    {description}
                  </p>
                )}

                {(button || secondaryButton) && (
                  <div className="flex w-full flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 md:justify-start md:pt-2 lg:pt-3">
                    {button &&
                      (button.href?.startsWith("#") ? (
                        <a
                          href={button.href}
                          onClick={(e) => {
                            e.preventDefault();
                            document
                              .querySelector(button.href!)
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90 sm:w-auto sm:px-6 sm:py-3 md:text-base"
                        >
                          {button.text}
                          <MoveRight className="h-4 w-4 shrink-0" aria-hidden />
                        </a>
                      ) : button.href ? (
                        <Link
                          href={button.href}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90 sm:w-auto sm:px-6 sm:py-3 md:text-base"
                        >
                          {button.text}
                          <MoveRight className="h-4 w-4 shrink-0" aria-hidden />
                        </Link>
                      ) : (
                        <Button
                          size="lg"
                          className="w-full rounded-full bg-secondary font-bold text-black hover:bg-secondary-600 sm:w-auto"
                          onClick={button.onClick}
                        >
                          {button.text}
                        </Button>
                      ))}
                    {secondaryButton && (
                      <Link
                        href={secondaryButton.href}
                        className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 sm:w-auto sm:px-6 sm:py-3 md:text-base"
                      >
                        {secondaryButton.text}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {showBookingForm && (
                <div className="w-full">
                  <Step1 />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
