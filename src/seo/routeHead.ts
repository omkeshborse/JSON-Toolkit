import { SITE_URL, SITE_NAME, OG_IMAGE } from '../siteConfig';
import { SEO_DATA_BY_PATH, ToolSeoData } from '../data/seoContent';
import { GUIDES_DATA } from '../data/guidesContent';

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
  '/about',
  '/privacy',
  '/contact',
  '/guides',
  '/guides/how-to-fix-common-json-syntax-errors',
  '/guides/how-to-compare-json-objects-differing-key-order',
  '/guides/jsonpath-examples-querying-nested-api-responses',
] as const;

export type KnownRoute = (typeof KNOWN_ROUTES)[number];

export function getRouteHead(path: string): RouteHeadData {
  const isHome = path === '/' || path === '';
  const canonicalUrl = `${SITE_URL}${isHome ? '/' : path}`;

  if (isHome) {
    const title = 'JSON Toolkit — Fast, Private Online JSON Tools | 101 JSON Toolkit';
    const description =
      'Format, validate, diff, query with JSONPath, inspect schemas, and view JSON trees in your browser. 100% client-side with zero telemetry.';
    const h1 = 'Free Online JSON Tools for Developers';

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
    const h1 = seoItem.h1 || `${seoItem.toolName}`;

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
            text: faq.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
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

  // Trust & Transparency Pages (About, Privacy, Contact)
  if (path === '/about') {
    const title = `About | ${SITE_NAME}`;
    const description =
      'Learn about 101 JSON Toolkit: our client-side architecture, open standards adherence (RFC 8259, JSON Schema Draft-07), and zero-telemetry developer utilities.';
    const h1 = 'About 101 JSON Toolkit';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          name: title,
          url: canonicalUrl,
          description,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'About', item: canonicalUrl },
          ],
        },
      ],
    };
    return {
      path,
      slug: 'about',
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

  if (path === '/privacy') {
    const title = `Privacy Policy | ${SITE_NAME}`;
    const description =
      'Our transparent privacy policy: client-side in-browser execution, zero JSON payload transmission, local storage usage, and absence of tracking cookies.';
    const h1 = 'Privacy Policy';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: title,
          url: canonicalUrl,
          description,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: canonicalUrl },
          ],
        },
      ],
    };
    return {
      path,
      slug: 'privacy',
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

  if (path === '/contact') {
    const title = `Contact & Feedback | ${SITE_NAME}`;
    const description =
      'Get in touch with 101 JSON Toolkit: report RFC parsing bugs, submit feature requests, or share feedback on our developer utilities.';
    const h1 = 'Contact & Feedback';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ContactPage',
          name: title,
          url: canonicalUrl,
          description,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Contact & Feedback', item: canonicalUrl },
          ],
        },
      ],
    };
    return {
      path,
      slug: 'contact',
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

  // Developer Guides Index (/guides)
  if (path === '/guides') {
    const title = `Technical JSON Guides & Developer Tutorials | ${SITE_NAME}`;
    const description =
      'In-depth technical guides for debugging JSON syntax errors, comparing JSON objects independent of key order, and querying API responses with JSONPath.';
    const h1 = 'Technical JSON Guides & Tutorials';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: title,
          url: canonicalUrl,
          description,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: canonicalUrl },
          ],
        },
      ],
    };
    return {
      path,
      slug: 'guides',
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

  // Individual Technical Guide Pages (/guides/:slug)
  if (path.startsWith('/guides/')) {
    const guideSlug = path.replace(/^\/guides\//, '');
    const guide = GUIDES_DATA[guideSlug];
    if (guide) {
      const title = `${guide.seoTitle} | ${SITE_NAME}`;
      const description = guide.metaDescription;
      const h1 = guide.h1;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            headline: guide.h1,
            name: guide.seoTitle,
            description: guide.metaDescription,
            url: canonicalUrl,
            inLanguage: 'en-US',
            datePublished: guide.datePublished,
            dateModified: guide.dateModified,
            about: [
              { '@type': 'Thing', name: 'JSON' },
              { '@type': 'Thing', name: guide.primaryKeyword },
            ],
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
              { '@type': 'ListItem', position: 3, name: guide.h1, item: canonicalUrl },
            ],
          },
        ],
      };
      return {
        path,
        slug: guideSlug,
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
      };
    }
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
