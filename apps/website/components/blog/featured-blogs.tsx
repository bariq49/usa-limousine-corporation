"use client";

import { Slider, SliderSlide } from "@usa-limousine-corporation/ui/components/slider";
import BlogCard from "@/components/blog/blog-card";
import type { FeaturedBlogsProps } from "@/types/blog.types";

export default function FeaturedBlogs(props: FeaturedBlogsProps) {
  const { blogs } = props;
  if (blogs.length === 0) return null;

  return (
    <section aria-labelledby="featured-blogs-heading" className="mb-14">
      <h2 id="featured-blogs-heading" className="mb-6 text-2xl font-semibold tracking-tight text-black">
        Featured
      </h2>

      <Slider slidesPerView={1} spaceBetween={24} navigation pagination autoplay>
        {blogs.map((blog) => (
          <SliderSlide key={blog.id} className="!h-auto">
            <BlogCard blog={blog} variant="landscape" />
          </SliderSlide>
        ))}
      </Slider>
    </section>
  );
}
