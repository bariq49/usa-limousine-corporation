export type BlogStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export type BlogCommentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TaxonomyKind = "category" | "tag";

export type Taxonomy = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { blogs: number };
};

export type BlogCategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Taxonomy | null | undefined;
};

export type BlogTagModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Taxonomy | null | undefined;
};

export type TaxonomyQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  isActive?: boolean | undefined;
};

export type TaxonomyPayload = {
  name: string;
  slug?: string | undefined;
  description?: string | null | undefined;
  image?: string | null | undefined;
  sortOrder?: number | undefined;
  isActive?: boolean | undefined;
};

export type Blog = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: BlogStatus;
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
  scheduledAt: string | null;
  publishedAt: string | null;
  sortOrder: number;
  readingTimeMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; slug: string };
  _count?: { comments: number };
};

export type BlogDetail = Blog & {
  content: string;
  tags: { tag: { id: string; name: string; slug: string } }[];
};

export type BlogQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: BlogStatus | undefined;
  categoryId?: string | undefined;
  isFeatured?: boolean | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type BlogPayload = {
  title: string;
  slug?: string | undefined;
  excerpt?: string | null | undefined;
  content: string;
  coverImage?: string | null | undefined;
  categoryId: string;
  tagIds: string[];
  status: BlogStatus;
  scheduledDate?: string | undefined;
  scheduledTime?: string | undefined;
  isFeatured: boolean;
  seoTitle?: string | null | undefined;
  seoDescription?: string | null | undefined;
  seoKeywords?: string | null | undefined;
  canonicalUrl?: string | null | undefined;
  ogTitle?: string | null | undefined;
  ogDescription?: string | null | undefined;
  ogImage?: string | null | undefined;
  robots?: string | null | undefined;
  jsonLd?: string | null | undefined;
  sortOrder?: number | undefined;
};

export type BlogComment = {
  id: string;
  blogId: string;
  fullName: string;
  email: string;
  content: string;
  status: BlogCommentStatus;
  replyContent: string | null;
  repliedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  blog: { id: string; title: string; slug: string };
};

export type BlogCommentQuery = {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  status?: BlogCommentStatus | undefined;
  blogId?: string | undefined;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
