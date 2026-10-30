import { MetadataRoute } from 'next';
import { getAppUrl } from "@/lib/api/base-url";
import { getBlogSitemap } from "@/lib/api/blogs";
import { AIRPORTS } from "@/constants/navigation";

export const revalidate = 300;

const baseUrl = getAppUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/services',
    '/services/airport-transfers',
    '/services/hourly-chauffeur',
    '/services/corporate-transportation',
    '/services/point-to-point-transfers',
    '/services/concert-transportation',
    '/services/sporting-event-transportation',
    '/services/wedding-transportation',
    '/services/prom-transportation',
    '/services/diplomatic-government-transportation',
    '/fleet/luxury-sedan',
    '/fleet/luxury-suv',
    '/fleet/luxury-suv-bench',
    '/fleet/premium-luxury-suv',
    '/fleet/premium-luxury-sedan',
    '/fleet/passenger-van',
    '/about-us',
    '/blog',
    '/contact-us',
  ];
  const articles = await getBlogSitemap();
  const airports = AIRPORTS.map((airport) => `/airports/${airport.slug}`);

  return routes
    .concat(airports)
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
