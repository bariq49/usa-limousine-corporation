import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  Blog,
  BlogComment,
  BlogCommentQuery,
  BlogCommentStatus,
  BlogDetail,
  BlogPayload,
  BlogQuery,
  Paginated,
  Taxonomy,
  TaxonomyKind,
  TaxonomyPayload,
  TaxonomyQuery,
} from "../types/blogs";

const taxonomyRoute = (kind: TaxonomyKind) =>
  kind === "category" ? API_ROUTES.BLOG_CATEGORIES : API_ROUTES.BLOG_TAGS;

export const getBlogs = (params?: BlogQuery) => {
  return http.get<Paginated<Blog>>(API_ROUTES.BLOGS, { params });
};

export const getBlog = (id: string) => {
  return http.get<BlogDetail>(`${API_ROUTES.BLOGS}/${id}`);
};

export const createBlog = (payload: BlogPayload) => {
  return http.post<BlogDetail>(API_ROUTES.BLOGS, payload);
};

export const updateBlog = (id: string, payload: Partial<BlogPayload>) => {
  return http.patch<BlogDetail>(`${API_ROUTES.BLOGS}/${id}`, payload);
};

export const deleteBlog = (id: string) => {
  return http.delete(`${API_ROUTES.BLOGS}/${id}`);
};

export const getTaxonomies = (kind: TaxonomyKind, params?: TaxonomyQuery) => {
  return http.get<Paginated<Taxonomy>>(taxonomyRoute(kind), { params });
};

export const createTaxonomy = (kind: TaxonomyKind, payload: TaxonomyPayload) => {
  return http.post<Taxonomy>(taxonomyRoute(kind), payload);
};

export const updateTaxonomy = (kind: TaxonomyKind, id: string, payload: TaxonomyPayload) => {
  return http.patch<Taxonomy>(`${taxonomyRoute(kind)}/${id}`, payload);
};

export const deleteTaxonomy = (kind: TaxonomyKind, id: string) => {
  return http.delete(`${taxonomyRoute(kind)}/${id}`);
};

export const getBlogComments = (params?: BlogCommentQuery) => {
  return http.get<Paginated<BlogComment>>(API_ROUTES.BLOG_COMMENTS, { params });
};

export const updateBlogComment = (id: string, status: BlogCommentStatus) => {
  return http.patch<BlogComment>(`${API_ROUTES.BLOG_COMMENTS}/${id}`, { status });
};

export const replyBlogComment = (id: string, content: string) => {
  return http.post<BlogComment>(`${API_ROUTES.BLOG_COMMENTS}/${id}/reply`, { content });
};

export const deleteBlogComment = (id: string) => {
  return http.delete(`${API_ROUTES.BLOG_COMMENTS}/${id}`);
};
