import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { FilterNav } from "@usa-limousine-corporation/ui/components/filter-nav";
import {
  buildCollectionJsonLd,
  buildPageMetadata,
  stringifyJsonLd,
} from "@usa-limousine-corporation/ui/utils/seo";
import BlogList from "@/components/blog/blog-list";
import FeaturedBlogs from "@/components/blog/featured-blogs";
import { BlogPageSkeleton } from "@/components/skeletons/blog-page-skeleton";
import { getAppUrl } from "@/lib/api/base-url";
import { getBlogCategories, getBlogPage, getFeaturedBlogs } from "@/lib/api/blogs";
import type { BlogPageProps, BlogSearch } from "@/types/blog.types";

export const revalidate = 60;

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categories = await getBlogCategories();
  const category = categories.find((item) => item.slug === params.category);

  let title = "Blog";
  let description = `Travel tips, airport guides and news from ${PLATFORM.shortName}.`;
  let path = "/blog";

  if (category) {
    title = `${category.name} | Blog`;
    description = category.description || `Articles in ${category.name} from ${PLATFORM.shortName}.`;
    path = `/blog?category=${category.slug}`;
  } else if (params.tag) {
    title = `#${params.tag} | Blog`;
    description = `Articles tagged “${params.tag}” from ${PLATFORM.shortName}.`;
    path = `/blog?tag=${encodeURIComponent(params.tag)}`;
  }

  return buildPageMetadata({
    title,
    description,
    siteUrl: getAppUrl(),
    path,
    siteName: PLATFORM.name,
  });
}

async function BlogPageContent({ search }: { search: BlogSearch }) {
  const isFiltered = Boolean(search.category || search.tag);
  const siteUrl = getAppUrl();

  const [featured, categories, list] = await Promise.all([
    isFiltered ? Promise.resolve([]) : getFeaturedBlogs(20),
    getBlogCategories(),
    getBlogPage({ page: 1, category: search.category, tag: search.tag }),
  ]);

  const activeCategory = categories.find((item) => item.slug === search.category);
  const schema = buildCollectionJsonLd({
    siteUrl,
    name: `${PLATFORM.shortName} Blog`,
    description: `Travel tips, airport guides and news from ${PLATFORM.shortName}.`,
    path: "/blog",
    siteName: PLATFORM.name,
    type: "Blog",
    items: list.data.map((blog) => ({
      title: blog.title,
      url: `${siteUrl}/blog/${blog.slug}`,
      datePublished: blog.publishedAt,
      image: blog.coverImage,
    })),
  });

  return (
    <main
      className={
        categories.length > 0
          ? "min-h-screen bg-white pt-24 pb-28 sm:pt-28 md:pt-32 md:pb-16"
          : "min-h-screen bg-white pt-24 pb-16 sm:pt-28 md:pt-32"
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema) }}
      />

      <section className="container mx-auto px-4">
        {featured.length > 0 ? <FeaturedBlogs blogs={featured} /> : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {activeCategory?.name ?? (search.tag ? `Tagged “${search.tag}”` : "Insights & Guides")}
            </h1>
            {activeCategory?.description ? (
              <p className="mt-1 max-w-2xl text-sm text-gray-600">{activeCategory.description}</p>
            ) : !search.tag ? (
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                Expert advice on airport transfers, executive travel, and premium ground
                transportation.
              </p>
            ) : null}
          </div>
        </div>

        <FilterNav
          label="Blog categories"
          allHref="/blog"
          activeId={search.category}
          mobileBottom
          items={categories.map((category) => ({
            id: category.slug,
            label: category.name,
            href: `/blog?category=${category.slug}`,
            count: category._count.blogs,
          }))}
        />

        {list.data.length === 0 ? (
          <div className="mt-10 rounded-sm border border-border px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-black">
              {search.category || search.tag
                ? "No articles match this filter"
                : "Content is being prepared"}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-600">
              {search.category || search.tag
                ? "Try another category or return to all articles to continue browsing."
                : "Our team is publishing travel guides and company updates. Please check back shortly."}
            </p>
            {search.category || search.tag ? (
              <Link
                href="/blog"
                className="mt-5 inline-flex text-sm font-semibold text-black hover:text-secondary"
              >
                View all articles
              </Link>
            ) : null}
          </div>
        ) : (
          <BlogList
            initial={list.data}
            page={list.page}
            pages={list.pages}
            category={search.category}
            tag={search.tag}
          />
        )}
      </section>
    </main>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const search = await searchParams;

  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogPageContent search={search} />
    </Suspense>
  );
}
