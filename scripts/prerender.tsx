import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KNOWN_ROUTES, getRouteHead, RouteHeadData } from '../src/seo/routeHead';
import { StaticPage } from '../src/seo/StaticPage';
import { SITE_URL } from '../src/siteConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const templatePath = path.resolve(distDir, 'index.html');

function buildHeadHtml(head: RouteHeadData): string {
  const parts: string[] = [
    `<title>${head.title}</title>`,
    `<meta name="description" content="${head.description}" />`,
    `<meta name="robots" content="${head.robots}" />`,
    `<meta name="bingbot" content="${head.robots.includes('noindex') ? 'noindex, follow' : 'index, follow'}" />`,
  ];

  if (head.canonical) {
    parts.push(`<link rel="canonical" href="${head.canonical}" />`);
  }

  // OpenGraph Tags
  parts.push(`<meta property="og:type" content="${head.ogType}" />`);
  parts.push(`<meta property="og:title" content="${head.ogTitle}" />`);
  parts.push(`<meta property="og:description" content="${head.ogDescription}" />`);
  parts.push(`<meta property="og:url" content="${head.ogUrl}" />`);
  parts.push(`<meta property="og:image" content="${head.ogImage}" />`);
  parts.push(`<meta property="og:site_name" content="101 JSON Toolkit" />`);

  // Twitter Card Tags
  parts.push(`<meta name="twitter:card" content="${head.twitterCard}" />`);
  parts.push(`<meta name="twitter:title" content="${head.twitterTitle}" />`);
  parts.push(`<meta name="twitter:description" content="${head.twitterDescription}" />`);
  parts.push(`<meta name="twitter:image" content="${head.twitterImage}" />`);

  // Schema.org JSON-LD
  if (head.jsonLd) {
    parts.push(
      `<script id="schema-ld-json" type="application/ld+json">${JSON.stringify(head.jsonLd)}</script>`
    );
  }

  return parts.join('\n    ');
}

function prerender(): void {
  console.log('🚀 Starting Static HTML Prerendering...');

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found at: ${templatePath}. Did you run "vite build" first?`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  // Check placeholders
  const hasHeadPlaceholder = baseHtml.includes('<!--seo-head-->');
  const hasRootPlaceholder = baseHtml.includes('<!--seo-root-->');

  console.log(`ℹ️ Template placeholder status: head=${hasHeadPlaceholder}, root=${hasRootPlaceholder}`);

  const sitemapUrls: Array<{ loc: string; priority: string; changefreq: string }> = [];
  const redirectRules: string[] = [];

  // Prerender known indexable routes
  for (const route of KNOWN_ROUTES) {
    const head = getRouteHead(route);
    const headHtml = buildHeadHtml(head);
    const bodyMarkup = renderToStaticMarkup(React.createElement(StaticPage, { routeHead: head }));

    let pageHtml = baseHtml;

    if (hasHeadPlaceholder) {
      pageHtml = pageHtml.replace('<!--seo-head-->', headHtml);
    } else {
      // Fallback: replace title if present or inject before </head>
      pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, headHtml);
    }

    if (hasRootPlaceholder) {
      pageHtml = pageHtml.replace('<!--seo-root-->', bodyMarkup);
    } else {
      pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${bodyMarkup}</div>`);
    }

    const filename = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
    const targetPath = path.resolve(distDir, filename);

    fs.writeFileSync(targetPath, pageHtml, 'utf-8');
    console.log(`  ✓ Generated: dist/${filename}`);

    const loc = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`;
    sitemapUrls.push({
      loc,
      priority: route === '/' ? '1.0' : '0.9',
      changefreq: route === '/' ? 'weekly' : 'monthly',
    });

    if (route !== '/') {
      // Explicit 200 rewrite rule for Netlify
      redirectRules.push(`${route}    /${filename}   200`);
    }
  }

  // Prerender 404.html (Strict: NO canonical, noindex)
  const head404 = getRouteHead('404');
  const head404Html = buildHeadHtml(head404);
  const body404Markup = renderToStaticMarkup(React.createElement(StaticPage, { routeHead: head404 }));

  let page404Html = baseHtml;
  if (hasHeadPlaceholder) {
    page404Html = page404Html.replace('<!--seo-head-->', head404Html);
  } else {
    page404Html = page404Html.replace(/<title>.*?<\/title>/i, head404Html);
  }

  if (hasRootPlaceholder) {
    page404Html = page404Html.replace('<!--seo-root-->', body404Markup);
  } else {
    page404Html = page404Html.replace('<div id="root"></div>', `<div id="root">${body404Markup}</div>`);
  }

  fs.writeFileSync(path.resolve(distDir, '404.html'), page404Html, 'utf-8');
  console.log('  ✓ Generated: dist/404.html (Strict noindex, no canonical)');

  // Generate sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('  ✓ Generated: dist/sitemap.xml');

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('  ✓ Generated: dist/robots.txt');

  // Generate _redirects for Netlify
  // Explicit route rewrites, with NO catch-all so unrecognized URLs fall through to 404.html
  const redirectsContent = `# Explicit route mappings for prerendered HTML pages
${redirectRules.join('\n')}
`;
  fs.writeFileSync(path.resolve(distDir, '_redirects'), redirectsContent, 'utf-8');
  console.log('  ✓ Generated: dist/_redirects (Explicit routes only; unknown URLs fall through to 404)');

  console.log('🎉 Prerendering successfully completed!');
}

prerender();
