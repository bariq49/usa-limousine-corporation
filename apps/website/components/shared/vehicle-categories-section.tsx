"use client";

import Image from "next/image";
import Link from "next/link";
import { Slider, SliderSlide } from "@usa-limousine-corporation/ui/components/slider";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { VehicleCategoriesSkeleton } from "@/components/skeletons/vehicle-categories-skeleton";
import { useVehicleCategories } from "@/hooks/queries/use-vehicle-categories";
import type { VehicleCategoriesSectionProps } from "@/types/vehicle-category.types";

export default function VehicleCategoriesSection(props: VehicleCategoriesSectionProps) {
  const { title = "Class of services", className } = props;
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

        <div className="mt-10 grid grid-cols-1 gap-5 md:hidden">
          {categories.map((category) => (
            <article
              key={category.id}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6"
            >
              {category.image ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              ) : null}
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900">
                {category.name}
              </h3>
              {category.models ? (
                <p className="mt-1 text-sm font-medium text-neutral-500">{category.models}</p>
              ) : null}
              {category.description ? (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {category.description}
                </p>
              ) : null}
              <Link
                href="/#hero-booking"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-85"
              >
                Book now
              </Link>
            </article>
          ))}
        </div>
      </div>

      <Slider
        className="mt-12 hidden md:block"
        spaceBetween={40}
        slidesPerView={1.5}
        breakpoints={{ 1280: { slidesPerView: 2.4 } }}
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
                  "flex h-full items-center gap-8 rounded-2xl border border-neutral-200 bg-white p-10 transition-all duration-500",
                  isActive ? "scale-100 shadow-xl" : "scale-95 opacity-50 grayscale",
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
                    {category.name}
                  </h3>
                  {category.models ? (
                    <p className="mt-2 text-sm font-medium text-neutral-500">{category.models}</p>
                  ) : null}
                  {category.description ? (
                    <p className="mt-4 line-clamp-5 text-base leading-relaxed text-neutral-600">
                      {category.description}
                    </p>
                  ) : null}
                  <Link
                    href="/#hero-booking"
                    tabIndex={isActive ? 0 : -1}
                    className="mt-8 inline-flex h-12 w-fit items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                  >
                    Book now
                  </Link>
                </div>
                {category.image ? (
                  <div className="relative h-48 w-2/5 shrink-0">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 1280px) 30vw, 20vw"
                      className="object-contain"
                    />
                  </div>
                ) : null}
              </article>
            )}
          </SliderSlide>
        ))}
      </Slider>
    </section>
  );
}
