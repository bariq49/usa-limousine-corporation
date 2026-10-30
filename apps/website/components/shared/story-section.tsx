import Image from "next/image";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { StorySectionProps } from "@/types/story.types";

export default function StorySection(props: StorySectionProps) {
  const { subtitle, title, paragraphs, image, imageAlt = "Story image", className } = props;

  if (!title || !image) {
    return null;
  }

  return (
    <section className={cn("w-full bg-neutral-50 py-16 sm:py-20 lg:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="flex flex-col">
            {subtitle ? (
              <span className="mb-3 text-xs font-semibold tracking-widest text-secondary uppercase sm:text-sm">
                {subtitle}
              </span>
            ) : null}
            <h2 className="text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            {paragraphs && paragraphs.length > 0 ? (
              <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative h-80 w-full overflow-hidden rounded-md sm:h-96 lg:h-112">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
