"use client";

import Image from "next/image";
import { Slider, SliderSlide } from "@usa-limousine-corporation/ui/components/slider";
import {
  ArrowUpRight,
  CircleCheck,
  Google,
  Star,
  StarSparkle,
} from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { TestimonialsSkeleton } from "@/components/skeletons/testimonials-skeleton";
import { useReviews } from "@/hooks/queries/use-reviews";
import type { TestimonialsSectionProps } from "@/types/review.types";

export default function TestimonialsSection(props: TestimonialsSectionProps) {
  const {
    title = "What Our Customers Say",
    description = "Trusted by thousands of riders for reliable, comfortable, and professional journeys — every single day.",
    className,
  } = props;
  const { data: summary, isLoading } = useReviews();

  if (isLoading) {
    return <TestimonialsSkeleton />;
  }

  if (!summary || summary.reviews.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full bg-white py-16 sm:py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            <StarSparkle className="h-8 w-8 shrink-0 text-neutral-900" />
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:text-base">
            {description}
            {summary.reviewsUrl ? (
              <a
                href={summary.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 align-middle text-sm font-medium whitespace-nowrap text-neutral-500 transition-opacity hover:opacity-80"
              >
                <Google className="h-4 w-4" />
                Google
                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
              </a>
            ) : null}
          </p>
        </div>

        <Slider
          className="mt-10"
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
          navigation={false}
          autoplay={{ delay: 4000 }}
          loop={summary.reviews.length > 4}
        >
          {summary.reviews.map((review) => (
            <SliderSlide key={`${review.authorName}-${review.time}`} className="h-auto">
              <article className="flex h-full flex-col rounded-md border border-neutral-200 bg-white p-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-sm",
                        index < review.rating ? "bg-primary" : "bg-neutral-200",
                      )}
                    >
                      <Star className="h-3 w-3 fill-white text-white" />
                    </span>
                  ))}
                </div>
                <p className="mt-5 line-clamp-5 flex-1 text-sm leading-relaxed text-neutral-600 italic sm:text-base">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <span className="relative shrink-0">
                    {review.photoUrl ? (
                      <Image
                        src={review.photoUrl}
                        alt={review.authorName}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">
                        {review.authorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="absolute -right-1 -bottom-1 rounded-full border border-neutral-100 bg-white p-0.5 shadow-sm">
                      <Google className="h-3 w-3" />
                    </span>
                  </span>
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-neutral-900">
                        {review.authorName}
                      </span>
                      <CircleCheck className="h-3.5 w-3.5 shrink-0 text-success" />
                    </span>
                    <span className="text-sm text-neutral-400">{review.relativeTime}</span>
                  </div>
                </div>
              </article>
            </SliderSlide>
          ))}
        </Slider>
      </div>
    </section>
  );
}
