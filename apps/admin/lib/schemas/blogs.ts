import { z } from "zod";

const slug = z
  .string()
  .trim()
  .max(120)
  .regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and dashes")
  .optional()
  .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || /^https?:\/\//i.test(value), "Use a full URL with https://");

const optionalJson = z
  .string()
  .trim()
  .max(50_000)
  .optional()
  .or(z.literal(""))
  .superRefine((value, context) => {
    if (!value) return;
    try {
      JSON.parse(value);
    } catch {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter valid JSON" });
    }
  });

export const taxonomySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  slug,
  description: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type TaxonomySchema = z.infer<typeof taxonomySchema>;

export const blogSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug,
    excerpt: z.string().trim().max(500).optional().or(z.literal("")),
    content: z.string().min(1, "Write the article content"),
    coverImage: z.string().optional().nullable().or(z.literal("")),
    categoryId: z.string().min(1, "Choose a category"),
    tagIds: z.array(z.string()).max(20, "Up to 20 tags"),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"] as const),
    scheduledDate: z.string().optional().or(z.literal("")),
    scheduledTime: z.string().optional().or(z.literal("")),
    isFeatured: z.boolean().default(false),
    seoTitle: z.string().trim().max(70, "Keep it under 70 characters").optional().or(z.literal("")),
    seoDescription: z
      .string()
      .trim()
      .max(160, "Keep it under 160 characters")
      .optional()
      .or(z.literal("")),
    seoKeywords: z.string().trim().max(300).optional().or(z.literal("")),
    canonicalUrl: optionalUrl,
    ogTitle: z.string().trim().max(70).optional().or(z.literal("")),
    ogDescription: z.string().trim().max(200).optional().or(z.literal("")),
    ogImage: optionalUrl,
    robots: z.string().trim().max(120).optional().or(z.literal("")),
    jsonLd: optionalJson,
    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((values, context) => {
    if (values.status === "SCHEDULED" && !values.scheduledDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledDate"],
        message: "Choose a publish date",
      });
    }
    if (values.status === "SCHEDULED" && !values.scheduledTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledTime"],
        message: "Choose a publish time",
      });
    }
  });

export type BlogSchema = z.infer<typeof blogSchema>;
