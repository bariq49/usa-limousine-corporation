"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@usa-limousine-corporation/ui/components/form";
import { Input, type InputOption } from "@usa-limousine-corporation/ui/components/input";
import { RichTextEditor } from "@usa-limousine-corporation/ui/components/rich-text-editor";
import { formatDate, formatTime } from "@usa-limousine-corporation/ui/utils/date";
import { useCreateBlog, useTaxonomies, useUpdateBlog } from "@/hooks/queries/use-blogs";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { blogSchema, type BlogSchema } from "@/lib/schemas/blogs";
import type { BlogDetail, BlogStatus } from "@/lib/types/blogs";

const STATUS_OPTIONS: InputOption[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Published", value: "PUBLISHED" },
];

const ROBOTS_OPTIONS: InputOption[] = [
  { label: "Index, follow (default)", value: "index,follow" },
  { label: "Index, nofollow", value: "index,nofollow" },
  { label: "Noindex, follow", value: "noindex,follow" },
  { label: "Noindex, nofollow", value: "noindex,nofollow" },
];

const REDIRECTS: Record<BlogStatus, string> = {
  DRAFT: "/blogs/drafts",
  SCHEDULED: "/blogs/scheduled",
  PUBLISHED: "/blogs",
};

const EMPTY: BlogSchema = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  categoryId: "",
  tagIds: [],
  status: "DRAFT",
  scheduledDate: "",
  scheduledTime: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  robots: "index,follow",
  jsonLd: "",
  sortOrder: 0,
};

function SideCard(props: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border border-border shadow-xs">
      <CardContent className="space-y-4 p-5">
        <h3 className="text-sm font-semibold text-default-900">{props.title}</h3>
        {props.children}
      </CardContent>
    </Card>
  );
}

export function BlogForm({ initialData }: { initialData?: BlogDetail | undefined }) {
  const router = useRouter();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const uploadMutation = useUploadFile();
  const { data: categories } = useTaxonomies("category", { limit: 100, isActive: true });
  const { data: tags } = useTaxonomies("tag", { limit: 100, isActive: true });

  const categoryOptions: InputOption[] = useMemo(
    () => (categories?.data ?? []).map((item) => ({ label: item.name, value: item.id })),
    [categories],
  );
  const tagOptions: InputOption[] = useMemo(
    () => (tags?.data ?? []).map((item) => ({ label: item.name, value: item.id })),
    [tags],
  );

  const form = useForm<BlogSchema>({
    resolver: zodResolver(blogSchema),
    mode: "all",
    defaultValues: EMPTY,
  });
  const status = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (!initialData) return;
    form.reset({
      title: initialData.title,
      slug: initialData.slug,
      excerpt: initialData.excerpt ?? "",
      content: initialData.content,
      coverImage: initialData.coverImage ?? "",
      categoryId: initialData.categoryId,
      tagIds: initialData.tags.map((item) => item.tag.id),
      status: initialData.status,
      scheduledDate: initialData.scheduledAt
        ? formatDate({ date: initialData.scheduledAt, as: "value" })
        : "",
      scheduledTime: initialData.scheduledAt
        ? formatTime({ date: initialData.scheduledAt, as: "value" })
        : "",
      isFeatured: initialData.isFeatured,
      seoTitle: initialData.seoTitle ?? "",
      seoDescription: initialData.seoDescription ?? "",
      seoKeywords: initialData.seoKeywords ?? "",
      canonicalUrl: initialData.canonicalUrl ?? "",
      ogTitle: initialData.ogTitle ?? "",
      ogDescription: initialData.ogDescription ?? "",
      ogImage: initialData.ogImage ?? "",
      robots: initialData.robots ?? "index,follow",
      jsonLd: initialData.jsonLd ?? "",
      sortOrder: initialData.sortOrder,
    });
  }, [form, initialData]);

  const upload = async (file: File) => {
    const result = await uploadMutation.mutateAsync({ file, folder: "blog" });
    return result.secureUrl || result.url;
  };

  const onSubmit = async (values: BlogSchema) => {
    const payload = {
      title: values.title,
      slug: values.slug || undefined,
      excerpt: values.excerpt || null,
      content: values.content,
      coverImage: values.coverImage || null,
      categoryId: values.categoryId,
      tagIds: values.tagIds,
      status: values.status,
      scheduledDate: values.status === "SCHEDULED" ? values.scheduledDate || undefined : undefined,
      scheduledTime: values.status === "SCHEDULED" ? values.scheduledTime || undefined : undefined,
      isFeatured: values.isFeatured,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
      seoKeywords: values.seoKeywords || null,
      canonicalUrl: values.canonicalUrl || null,
      ogTitle: values.ogTitle || null,
      ogDescription: values.ogDescription || null,
      ogImage: values.ogImage || null,
      robots: values.robots || null,
      jsonLd: values.jsonLd || null,
      sortOrder: values.sortOrder,
    };
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push(REDIRECTS[values.status]);
    } catch {
      return;
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const submitLabel =
    status === "PUBLISHED" ? "Publish" : status === "SCHEDULED" ? "Schedule" : "Save Draft";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <Card className="border border-border shadow-xs">
            <CardContent className="space-y-4 p-6">
              <Input name="title" label="Title" />
              <Input
                name="slug"
                label="URL Slug (Optional)"
                hint="Created from the title when left empty"
              />
              <Input name="excerpt" label="Short Summary (Optional)" type="textarea" />
              <FormField
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      onUploadImage={upload}
                      hasError={Boolean(fieldState.error)}
                      disabled={isPending}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs">
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="text-sm font-semibold text-default-900">Search Engine (SEO)</h3>
                <p className="mt-1 text-xs text-default-500">
                  Meta tags, social share, and structured data for this article
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input name="seoTitle" label="SEO Title (Optional)" hint="Up to 70 characters" />
                <Input
                  name="seoKeywords"
                  label="Keywords (Optional)"
                  hint="Comma-separated keywords"
                />
              </div>
              <Input
                name="seoDescription"
                label="Meta Description (Optional)"
                type="textarea"
                hint="Up to 160 characters"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  name="canonicalUrl"
                  label="Canonical URL (Optional)"
                  hint="Absolute URL, e.g. https://example.com/blog/slug"
                />
                <Input name="robots" label="Robots" type="select" options={ROBOTS_OPTIONS} />
              </div>
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-default-500">
                  Open Graph
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input name="ogTitle" label="OG Title (Optional)" hint="Defaults to SEO title" />
                    <Input
                      name="ogImage"
                      label="OG Image URL (Optional)"
                      hint="Absolute image URL for social shares"
                    />
                  </div>
                  <Input
                    name="ogDescription"
                    label="OG Description (Optional)"
                    type="textarea"
                    hint="Defaults to meta description"
                  />
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <Input
                  name="jsonLd"
                  label="JSON-LD Structured Data (Optional)"
                  type="textarea"
                  hint='Paste Article schema JSON, e.g. {"@context":"https://schema.org","@type":"Article",...}'
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          <SideCard title="Publish">
            <Input name="status" label="Status" type="select" options={STATUS_OPTIONS} />
            {status === "SCHEDULED" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Input name="scheduledDate" label="Publish Date" type="date" disablePast />
                <Input name="scheduledTime" label="Publish Time" type="time" />
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-default-700">Featured</p>
                <p className="text-xs text-default-500">Highlight on the blog page</p>
              </div>
              <Input name="isFeatured" type="switch" switchSize="md" />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} isLoading={isPending}>
                {initialData && status === initialData.status ? "Save Changes" : submitLabel}
              </Button>
            </div>
          </SideCard>

          <SideCard title="Cover Image">
            <Input name="coverImage" type="upload" accept="image/*" onUpload={upload} />
          </SideCard>

          <SideCard title="Organize">
            <Input name="categoryId" label="Category" type="select" options={categoryOptions} />
            <Input name="tagIds" label="Tags" type="multiselect" options={tagOptions} />
            <Input name="sortOrder" label="Featured Order" type="number" min="0" />
          </SideCard>
        </div>
      </form>
    </Form>
  );
}
