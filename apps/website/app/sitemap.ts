import { MetadataRoute } from 'next';
import { getAppUrl } from "@/lib/api/base-url";

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

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
