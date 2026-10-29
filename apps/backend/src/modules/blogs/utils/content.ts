import { ConflictException } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function uniqueSlug(
  isTaken: (slug: string) => Promise<boolean>,
  requested: string | undefined,
  title: string,
) {
  if (requested) {
    if (await isTaken(requested)) {
      throw new ConflictException("An article with this slug already exists");
    }
    return requested;
  }
  const base = slugify(title) || "article";
  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    if (!(await isTaken(slug))) return slug;
  }
  return `${base}-${Date.now()}`;
}

export function sanitizeContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2",
      "h3",
      "h4",
      "p",
      "br",
      "hr",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "a",
      "blockquote",
      "code",
      "pre",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}

export function sanitizeComment(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTime(html: string) {
  const words = sanitizeComment(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
