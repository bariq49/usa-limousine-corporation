import { MetadataRoute } from 'next';
import { getAppUrl } from "@/lib/api/base-url";

const baseUrl = getAppUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
