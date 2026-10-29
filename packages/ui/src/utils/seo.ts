import type { Metadata } from "next";
import type {
  ArticleJsonLd,
  ArticleMeta,
  ListJsonLd,
  PageMeta,
  SiteMeta,
} from "../types/seo";
import { omitUndefined } from "./cn";

export type {
  ArticleJsonLd,
  ArticleMeta,
  JsonLdItem,
  ListJsonLd,
  PageMeta,
  Seo,
  SiteMeta,
} from "../types/seo";

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteUrl.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export function withPageQuery(path: string, page?: number): string {
  if (!page || page <= 1) return path;
  return `${path}${path.includes("?") ? "&" : "?"}page=${page}`;
}

export function parseRobots(value?: string | null): Metadata["robots"] {
  if (!value?.trim()) return { index: true, follow: true };
  const normalized = value.toLowerCase();
  return {
    index: !normalized.includes("noindex"),
    follow: !normalized.includes("nofollow"),
  };
}

export function stringifyJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function parseJsonLd(value?: string | null): unknown | null {
  if (!value?.trim()) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function buildPageMetadata(input: PageMeta): Metadata {
  const type = input.type ?? "website";
  const title = input.title;
  const description = input.description;
  const canonical = input.canonicalUrl || absoluteUrl(input.siteUrl, input.path);
  const ogTitle = input.ogTitle || title;
  const ogDescription = input.ogDescription || description;
  const ogImage = input.ogImage || input.image || null;

  const openGraph = (
    type === "article"
      ? omitUndefined({
          type: "article" as const,
          title: ogTitle,
          description: ogDescription,
          url: canonical,
          siteName: input.siteName,
          locale: input.locale,
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
          section: input.section,
          tags: input.tags,
          images: ogImage ? [{ url: ogImage, alt: ogTitle }] : undefined,
        })
      : omitUndefined({
          type: "website" as const,
          title: ogTitle,
          description: ogDescription,
          url: canonical,
          siteName: input.siteName,
          locale: input.locale,
          images: ogImage ? [{ url: ogImage, alt: ogTitle }] : undefined,
        })
  ) as NonNullable<Metadata["openGraph"]>;

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: ogImage ? "summary_large_image" : "summary",
    title: ogTitle,
    description: ogDescription,
  };
  if (ogImage) twitter.images = [ogImage];

  const meta: Metadata = {
    title,
    description,
    alternates: { canonical },
    robots: parseRobots(input.robots),
    openGraph,
    twitter,
  };
  if (input.keywords) meta.keywords = input.keywords;

  return meta;
}

export function buildArticleMetadata(article: ArticleMeta, site: SiteMeta): Metadata {
  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.description || site.fallbackDescription || "";
  const ogImage = article.ogImage || article.coverImage || null;

  const input: PageMeta = {
    title,
    description,
    siteUrl: site.siteUrl,
    path: site.path,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  };
  if (site.siteName) input.siteName = site.siteName;
  if (article.seoKeywords) input.keywords = article.seoKeywords;
  if (article.canonicalUrl) input.canonicalUrl = article.canonicalUrl;
  if (article.robots) input.robots = article.robots;
  if (article.ogTitle) input.ogTitle = article.ogTitle;
  if (article.ogDescription) input.ogDescription = article.ogDescription;
  if (ogImage) {
    input.ogImage = ogImage;
    input.image = ogImage;
  }
  if (article.section) input.section = article.section;
  if (article.tags?.length) input.tags = article.tags;
  if (site.locale) input.locale = site.locale;

  return buildPageMetadata(input);
}

export function buildCollectionJsonLd(input: ListJsonLd) {
  const url = absoluteUrl(input.siteUrl, input.path);
  const type = input.type ?? "CollectionPage";
  const site = input.siteUrl.replace(/\/$/, "");
  const publisher = input.siteName
    ? { "@type": "Organization", name: input.siteName, url: site }
    : undefined;
  const items = (input.items ?? []).map((item) => ({
    "@type": "BlogPosting",
    headline: item.title,
    url: item.url,
    datePublished: item.datePublished,
    image: item.image || undefined,
  }));

  if (type === "ItemList") {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: input.name,
      description: input.description,
      url,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.headline,
      })),
    };
  }

  if (type === "Blog") {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: input.name,
      description: input.description,
      url,
      publisher,
      blogPost: items,
    };
  }

  if (items.length > 0) {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: input.name,
      description: input.description,
      url,
      publisher,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items,
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url,
    publisher,
  };
}

export function buildArticleJsonLd(input: ArticleJsonLd) {
  const custom = parseJsonLd(input.jsonLd);
  if (custom) return custom;

  const site = input.siteUrl.replace(/\/$/, "");
  const url = input.canonicalUrl || absoluteUrl(input.siteUrl, input.path);
  const organization = input.siteName
    ? { "@type": "Organization", name: input.siteName, url: site }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.seoTitle || input.title,
    description: input.seoDescription || input.description || undefined,
    image: input.ogImage || input.coverImage || undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    mainEntityOfPage: url,
    articleSection: input.section,
    keywords: input.seoKeywords || (input.tags?.length ? input.tags.join(", ") : undefined),
    author: organization,
    publisher: organization,
  };
}
