export type Seo = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  jsonLd?: string | null;
};

export type PageMeta = {
  title: string;
  description: string;
  siteUrl: string;
  path: string;
  siteName?: string;
  keywords?: string | string[] | null;
  image?: string | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  type?: "website" | "article";
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
};

export type ArticleMeta = Seo & {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  publishedAt: string;
  updatedAt: string;
  section?: string;
  tags?: string[];
};

export type SiteMeta = {
  siteUrl: string;
  path: string;
  siteName?: string;
  fallbackDescription?: string;
  locale?: string;
};

export type JsonLdItem = {
  title: string;
  url: string;
  datePublished?: string;
  image?: string | null;
};

export type ListJsonLd = {
  siteUrl: string;
  name: string;
  description: string;
  path: string;
  siteName?: string;
  type?: "Blog" | "CollectionPage" | "ItemList";
  items?: JsonLdItem[];
};

export type ArticleJsonLd = Seo & {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  publishedAt: string;
  updatedAt: string;
  path: string;
  siteUrl: string;
  siteName?: string;
  section?: string;
  tags?: string[];
};
