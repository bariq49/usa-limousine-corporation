import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { ArrowLeft, Calendar, Clock, Eye, MessageSquare } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildArticleMetadata,
  stringifyJsonLd,
} from "@usa-limousine-corporation/ui/utils/seo";
import BlogComments from "@/components/blog/blog-comments";
import BlogShare from "@/components/blog/blog-share";
import BlogSidebarCard from "@/components/blog/blog-sidebar-card";
import BlogViewTracker from "@/components/blog/blog-view-tracker";
import { BlogArticleSkeleton } from "@/components/skeletons/blog-article-skeleton";
import { getAppUrl } from "@/lib/api/base-url";
import { getBlogArticle, getBlogCategories, getBlogPage } from "@/lib/api/blogs";
import { toArticleJsonLd, toArticleMeta } from "@/lib/blog-meta";
import type { BlogArticleProps } from "@/types/blog.types";

export const revalidate = 60;

export async function generateMetadata({ params }: BlogArticleProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogArticle(slug);
  if (!blog) return { title: "Article not found", robots: { index: false, follow: false } };
  return buildArticleMetadata(toArticleMeta({ blog }), {
    siteUrl: getAppUrl(),
    path: `/blog/${blog.slug}`,
    siteName: PLATFORM.name,
    fallbackDescription: PLATFORM.description,
  });
}

async function ArticleContent({ slug }: { slug: string }) {
  const siteUrl = getAppUrl();
  const [blog, categories, recent] = await Promise.all([
    getBlogArticle(slug),
    getBlogCategories(),
    getBlogPage({ page: 1, limit: 4 }),
  ]);
  if (!blog) notFound();

  const path = `/blog/${blog.slug}`;
  const url = blog.canonicalUrl || absoluteUrl(siteUrl, path);
  const recentPosts = recent.data.filter((item) => item.id !== blog.id).slice(0, 3);
  const publishedOn = formatDate({
    date: blog.publishedAt,
    options: { month: "long", day: "numeric", year: "numeric" },
  });
  const schema = buildArticleJsonLd(
    toArticleJsonLd({ blog, path, siteUrl, siteName: PLATFORM.name }),
  );

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 sm:pt-28 md:pt-32">
      <BlogViewTracker slug={blog.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(schema) }}
      />

      <div className="container mx-auto px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <article className="min-w-0 lg:col-span-8" itemScope itemType="https://schema.org/BlogPosting">
            <Link
              href={`/blog?category=${blog.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-secondary"
            >
              {blog.category.name}
            </Link>
            <h1
              className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl"
              itemProp="headline"
            >
              {blog.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={blog.publishedAt}>{publishedOn}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {blog.readingTimeMinutes} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {blog.viewCount} views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {blog._count.comments} comments
              </span>
            </div>

            {blog.coverImage ? (
              <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-sm bg-gray-100">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                  itemProp="image"
                />
              </div>
            ) : null}

            {blog.excerpt ? (
              <p className="mt-8 text-lg leading-relaxed text-gray-700" itemProp="description">
                {blog.excerpt}
              </p>
            ) : null}

            <div
              className="rich-content mt-6 text-gray-800"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <div className="mt-10 flex flex-col gap-5 border-y border-border py-6 sm:flex-row sm:items-center sm:justify-between">
              {blog.tags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {blog.tags.map((item) => (
                    <Link
                      key={item.tag.id}
                      href={`/blog?tag=${item.tag.slug}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-secondary/15 hover:text-secondary"
                    >
                      #{item.tag.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <span />
              )}
              <BlogShare url={url} title={blog.title} />
            </div>

            <div className="mt-10">
              <BlogComments slug={blog.slug} />
            </div>
          </article>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-28">
              {recentPosts.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-black">
                    Recent Articles
                  </h2>
                  <div className="mt-4 space-y-3">
                    {recentPosts.map((post) => (
                      <BlogSidebarCard key={post.id} blog={post} />
                    ))}
                  </div>
                </div>
              ) : null}

              {categories.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-black">Categories</h2>
                  <ul className="mt-4 divide-y divide-border rounded-sm border border-border">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/blog?category=${category.slug}`}
                          className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:text-secondary"
                        >
                          {category.name}
                          <span className="text-xs text-gray-400">{category._count.blogs}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-sm bg-black p-6 text-white">
                <h2 className="text-lg font-semibold">Ready to ride?</h2>
                <p className="mt-2 text-sm text-white/70">
                  Chauffeured rides {PLATFORM.contact.availability.toLowerCase()}. Get an instant
                  quote in minutes.
                </p>
                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-sm bg-secondary px-5 py-2.5 text-sm font-semibold text-black hover:bg-secondary/90"
                >
                  Book a ride
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default async function ArticlePage({ params }: BlogArticleProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<BlogArticleSkeleton />}>
      <ArticleContent slug={slug} />
    </Suspense>
  );
}
