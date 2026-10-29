export type Taxonomy = {
  id: string;
  name: string;
  slug: string;
};

export type BlogCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  publishedAt: string;
  readingTimeMinutes: number;
  viewCount: number;
  category: Taxonomy;
  tags: { tag: Taxonomy }[];
  _count: { comments: number };
};

export type BlogArticle = BlogCard & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robots: string | null;
  jsonLd: string | null;
  updatedAt: string;
};

export type BlogCategory = Taxonomy & {
  description: string | null;
  image: string | null;
  _count: { blogs: number };
};

export type BlogPage = {
  data: BlogCard[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type BlogComment = {
  id: string;
  fullName: string;
  content: string;
  replyContent: string | null;
  repliedAt: string | null;
  createdAt: string;
};

export type BlogCommentPage = {
  data: BlogComment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type BlogListQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  category?: string | undefined;
  tag?: string | undefined;
};

export type BlogCommentBody = {
  fullName: string;
  email: string;
  content: string;
};

export type BlogSitemapItem = {
  slug: string;
  updatedAt: string;
};

export type BlogSearch = {
  category?: string;
  tag?: string;
};

export type BlogPageProps = {
  searchParams: Promise<BlogSearch>;
};

export type BlogArticleProps = {
  params: Promise<{ slug: string }>;
};

export type BlogCardProps = {
  blog: BlogCard;
  variant?: "default" | "landscape";
};

export type BlogListProps = {
  initial: BlogCard[];
  page: number;
  pages: number;
  category?: string | undefined;
  tag?: string | undefined;
};

export type FeaturedBlogsProps = {
  blogs: BlogCard[];
};

export type ArticleMetaArgs = {
  blog: BlogArticle;
};

export type ArticleJsonLdArgs = {
  blog: BlogArticle;
  path: string;
  siteUrl: string;
  siteName: string;
};
