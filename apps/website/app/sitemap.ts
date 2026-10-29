import { MetadataRoute } from 'next';
import { getAppUrl } from "@/lib/api/base-url";
import { getBlogSitemap } from "@/lib/api/blogs";

export const revalidate = 300;

const baseUrl = getAppUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/services',
    '/about-us',
    '/blog',
    '/contact-us',
  ];
  const articles = await getBlogSitemap();

  return routes
    .map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? ('daily' as const) : ('weekly' as const),
      priority: route === '' ? 1.0 : 0.8,
    }))
    .concat(
      articles.map((article) => ({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    );
}
