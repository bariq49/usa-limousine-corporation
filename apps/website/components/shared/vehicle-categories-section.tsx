"use client";

import Image from "next/image";
import Link from "next/link";
import { Slider, SliderSlide } from "@usa-limousine-corporation/ui/components/slider";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { VehicleCategoriesSkeleton } from "@/components/skeletons/vehicle-categories-skeleton";
import { useVehicleCategories } from "@/hooks/queries/use-vehicle-categories";
import type { VehicleCategoriesSectionProps } from "@/types/vehicle-category.types";

export default function VehicleCategoriesSection(props: VehicleCategoriesSectionProps) {
  const {
    title = "Class of services",
    description = "From executive sedans to spacious SUVs and passenger vans, choose the vehicle that fits your journey — every ride chauffeured, comfortable, and on time.",
    className,
  } = props;
  const { data: categories, isLoading } = useVehicleCategories();

  if (isLoading) {
    return <VehicleCategoriesSkeleton />;
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const slides =
    categories.length > 1 && categories.length < 6 ? categories.concat(categories) : categories;

  return (
    <section className={cn("w-full overflow-hidden bg-white py-16 sm:py-20", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-neutral-500 sm:text-base">
            {description}
          </p>
        ) : null}

        <Slider
          className="mt-8 md:mt-12"
          spaceBetween={12}
          slidesPerView={1.1}
          breakpoints={{
            768: { slidesPerView: 1.3, spaceBetween: 16 },
            1280: { slidesPerView: 1.8, spaceBetween: 20 },
          }}
          centeredSlides
          navigation={false}
          autoplay={{ delay: 5000 }}
          loop={categories.length > 1}
        >
          {slides.map((category, index) => (
            <SliderSlide key={`${category.id}-${index}`} className="h-auto py-6">
              {({ isActive }) => (
                <article
                  className={cn(
                    "flex h-full flex-col gap-5 rounded-md border border-neutral-300 bg-white p-6 transition-all duration-500 md:flex-row md:items-center md:gap-8 md:p-10",
                    isActive ? "scale-100 shadow-xl" : "scale-95 opacity-50 grayscale",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl lg:text-4xl">
                      {category.name}
                    </h3>
                    {category.models ? (
                      <p className="mt-2 text-sm font-medium text-neutral-500">{category.models}</p>
                    ) : null}
                    {category.description ? (
                      <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-neutral-600 md:mt-4 md:text-base">
                        {category.description}
                      </p>
                    ) : null}
                    <Link
                      href="/book-ride"
                      tabIndex={isActive ? 0 : -1}
                      className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-85 md:mt-8 md:w-fit"
                    >
                      Book now
                    </Link>
                  </div>
                  {category.image ? (
                    <div className="relative order-first h-40 w-full shrink-0 md:order-last md:h-48 md:w-2/5">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 85vw, 30vw"
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                </article>
              )}
            </SliderSlide>
          ))}
        </Slider>
      </div>
    </section>
  );
}
