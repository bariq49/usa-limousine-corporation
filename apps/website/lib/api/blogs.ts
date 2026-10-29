import API_ROUTES from "@/config/routes";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { api } from "./client";
import type {
  BlogArticle,
  BlogCard,
  BlogCategory,
  BlogCommentBody,
  BlogCommentPage,
  BlogListQuery,
  BlogPage,
  BlogSitemapItem,
} from "@/types/blog.types";

const REVALIDATE = 60;

type ApiBody<T> = {
  data?: T;
};

async function getPublic<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      next: { revalidate: REVALIDATE, tags: ["blogs"] },
    });
    if (!response.ok) return fallback;
    const body = (await response.json()) as ApiBody<T>;
    return body.data ?? fallback;
  } catch {
    return fallback;
  }
}

export const getBlogPage = async (query: BlogListQuery = {}): Promise<BlogPage> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 9;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (query.category) params.set("category", query.category);
  if (query.tag) params.set("tag", query.tag);

  return getPublic<BlogPage>(`${API_ROUTES.BLOGS}?${params.toString()}`, {
    data: [],
    total: 0,
    page,
    limit,
    pages: 1,
  });
};

export const fetchBlogPage = async (query: BlogListQuery = {}): Promise<BlogPage> => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 9;
  const response = await api.get(API_ROUTES.BLOGS, {
    params: {
      page,
      limit,
      ...(query.category ? { category: query.category } : {}),
      ...(query.tag ? { tag: query.tag } : {}),
    },
  });
  return response.data;
};

export const getFeaturedBlogs = async (limit = 6): Promise<BlogCard[]> =>
  getPublic(`${API_ROUTES.BLOGS}/featured?limit=${limit}`, []);

export const getBlogCategories = async (): Promise<BlogCategory[]> =>
  getPublic(API_ROUTES.BLOG_CATEGORIES, []);

export const getBlogArticle = async (slug: string): Promise<BlogArticle | null> =>
  getPublic(`${API_ROUTES.BLOGS}/${encodeURIComponent(slug)}`, null);

export const getBlogSitemap = async (): Promise<BlogSitemapItem[]> =>
  getPublic(`${API_ROUTES.BLOGS}/sitemap`, []);

export const recordBlogView = async (slug: string) =>
  api.post(`${API_ROUTES.BLOGS}/${encodeURIComponent(slug)}/views`);

export const getBlogComments = async (slug: string, page = 1): Promise<BlogCommentPage> => {
  const response = await api.get(`${API_ROUTES.BLOGS}/${encodeURIComponent(slug)}/comments`, {
    params: { page, limit: 10 },
  });
  return response.data;
};

export const postBlogComment = async (slug: string, body: BlogCommentBody) =>
  api.post(`${API_ROUTES.BLOGS}/${encodeURIComponent(slug)}/comments`, body);
