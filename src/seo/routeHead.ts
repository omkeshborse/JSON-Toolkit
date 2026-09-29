import { SITE_URL, SITE_NAME, OG_IMAGE } from '../siteConfig';
import { SEO_DATA_BY_PATH, ToolSeoData } from '../data/seoContent';

export interface RouteHeadData {
  path: string;
  slug: string;
  title: string;
  description: string;
  canonical: string | null;
  robots: string;
  h1: string;
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLd: Record<string, unknown> | null;
  seoContent?: ToolSeoData;
}

export const KNOWN_ROUTES = [
  '/',
  '/json-formatter',
  '/json-validator',
  '/json-viewer',
  '/json-minifier',
  '/json-compare',
  '/jsonpath',
  '/json-schema',
] as const;

export type KnownRoute = (typeof KNOWN_ROUTES)[number];

export function getRouteHead(path: string): RouteHeadData {
  const isHome = path === '/' || path === '';
  const canonicalUrl = `${SITE_URL}${isHome ? '/' : path}`;

  if (isHome) {
    const title = 'Free Online JSON Tools for Developers | 101 JSON Toolkit';
    const description =
      'A fast, secure, client-side suite of developer utilities to format, validate, minify, inspect, compare, and query JSON data in your browser.';
    const h1 = 'Free Online JSON Formatter, Validator & Viewer Toolkit';

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: SITE_NAME,
          url: canonicalUrl,
          description,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'All',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      ],
    };

    return {
      path: '/',
      slug: 'index',
      title,
      description,
      canonical: canonicalUrl,
      robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      h1,
      ogType: 'website',
      ogTitle: title,
      ogDescription: description,
      ogUrl: canonicalUrl,
      ogImage: OG_IMAGE,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: OG_IMAGE,
      jsonLd,
    };
  }

  const seoItem = SEO_DATA_BY_PATH[path];

  if (seoItem) {
    const title = seoItem.metaTitle;
    const description = seoItem.metaDescription;
    const h1 = `${seoItem.toolName}`;

    const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'WebApplication',
        name: `${seoItem.toolName} | ${SITE_NAME}`,
        url: canonicalUrl,
        description,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: seoItem.toolName,
            item: canonicalUrl,
          },
        ],
      },
    ];

    if (seoItem.faqs?.items && seoItem.faqs.items.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: seoItem.faqs.items.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': graph,
    };

    const cleanSlug = path.replace(/^\//, '');

    return {
      path,
      slug: cleanSlug,
      title,
      description,
      canonical: canonicalUrl,
      robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      h1,
      ogType: 'article',
      ogTitle: title,
      ogDescription: description,
      ogUrl: canonicalUrl,
      ogImage: OG_IMAGE,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: OG_IMAGE,
      jsonLd,
      seoContent: seoItem,
    };
  }

  // 404 Route Head: NO canonical, noindex
  return {
    path,
    slug: '404',
    title: `404 - Page Not Found | ${SITE_NAME}`,
    description:
      'The requested page could not be found. Explore our free developer tools including JSON Formatter, Validator, Viewer, Minifier, and Schema utilities.',
    canonical: null,
    robots: 'noindex, follow',
    h1: '404 - Page Not Found',
    ogType: 'website',
    ogTitle: `404 - Page Not Found | ${SITE_NAME}`,
    ogDescription:
      'The requested page could not be found. Explore our developer tools including JSON Formatter, Validator, and Viewer.',
    ogUrl: `${SITE_URL}/404.html`,
    ogImage: OG_IMAGE,
    twitterCard: 'summary',
    twitterTitle: `404 - Page Not Found | ${SITE_NAME}`,
    twitterDescription: 'The requested page could not be found.',
    twitterImage: OG_IMAGE,
    jsonLd: null,
  };
}
