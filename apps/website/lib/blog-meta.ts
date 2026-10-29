import type { ArticleJsonLd, ArticleMeta } from "@usa-limousine-corporation/ui/utils/seo";
import type { ArticleJsonLdArgs, ArticleMetaArgs } from "@/types/blog.types";

export function toArticleMeta(args: ArticleMetaArgs): ArticleMeta {
  const { blog } = args;
  return {
    title: blog.title,
    description: blog.excerpt,
    coverImage: blog.coverImage,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    seoKeywords: blog.seoKeywords,
    canonicalUrl: blog.canonicalUrl,
    ogTitle: blog.ogTitle,
    ogDescription: blog.ogDescription,
    ogImage: blog.ogImage,
    robots: blog.robots,
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
    section: blog.category.name,
    tags: blog.tags.map((item) => item.tag.name),
  };
}

export function toArticleJsonLd(args: ArticleJsonLdArgs): ArticleJsonLd {
  const { blog, path, siteUrl, siteName } = args;
  return {
    title: blog.title,
    description: blog.excerpt,
    coverImage: blog.coverImage,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    seoKeywords: blog.seoKeywords,
    canonicalUrl: blog.canonicalUrl,
    ogTitle: blog.ogTitle,
    ogDescription: blog.ogDescription,
    ogImage: blog.ogImage,
    robots: blog.robots,
    jsonLd: blog.jsonLd,
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
    path,
    siteUrl,
    siteName,
    section: blog.category.name,
    tags: blog.tags.map((item) => item.tag.name),
  };
}
