import type { BlogStatus } from "@prisma/client";

export type CreateData = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  categoryId: string;
  status: BlogStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  robots: string | null;
  jsonLd: string | null;
  sortOrder: number;
  readingTimeMinutes: number;
};

export type UpdateData = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  categoryId?: string;
  status?: BlogStatus;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  jsonLd?: string | null;
  sortOrder?: number;
  readingTimeMinutes?: number;
};

export type ScheduleProps = {
  status: BlogStatus;
  scheduledDate?: string | undefined;
  scheduledTime?: string | undefined;
  publishedAt: Date | null;
};
