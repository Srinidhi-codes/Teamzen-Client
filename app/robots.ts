import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    'https://teamzen-client-v2-beta.vercel.app'
  ).replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/privacy', '/cookies'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/attendance/',
          '/payroll/',
          '/leaves/',
          '/employees/',
          '/team/',
          '/policies/',
          '/notifications/',
          '/feedback/',
          '/analytics/',
          '/exit/',
          '/onboarding/',
          '/performance/',
          '/profile/',
          '/feed/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
