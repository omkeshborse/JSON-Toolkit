import React, { useState, useCallback, useEffect } from 'react';
import { RouterProvider, useRouter, normalizePath } from './router';
import { ToastMessage } from './types';
import { Toast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { JsonFormatterPage } from './pages/JsonFormatterPage';
import { JsonValidatorPage } from './pages/JsonValidatorPage';
import { JsonViewerPage } from './pages/JsonViewerPage';
import { JsonMinifierPage } from './pages/JsonMinifierPage';
import { JsonComparePage } from './pages/JsonComparePage';
import { JsonPathPage } from './pages/JsonPathPage';
import { JsonSchemaPage } from './pages/JsonSchemaPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SEO_DATA_BY_PATH } from './data/seoContent';

function AppContent() {
  const { path } = useRouter();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update dynamic page title, canonical link, and social metadata per route
  useEffect(() => {
    const seoItem = SEO_DATA_BY_PATH[path];
    const pageTitle = seoItem
      ? seoItem.metaTitle
      : path === '/'
      ? 'Free JSON Formatter & Validator Online | 101 JSON Toolkit'
      : '404 - Page Not Found | 101 JSON Toolkit';
    const pageDescription = seoItem
      ? seoItem.metaDescription
      : path === '/'
      ? 'Free online JSON formatter, validator, beautifier and viewer. Format, validate and analyze JSON instantly in your browser.'
      : 'The page you requested could not be found. Explore our developer tools including JSON Formatter, Validator, Viewer, and Schema utilities.';

    document.title = pageTitle;

    // Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', pageDescription);
    }

    // Update OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle);
    }
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', pageDescription);
    }

    // Update or Insert Canonical Link (Always using the authoritative domain)
    const canonicalUrl = `https://101jsontoolkit.netlify.app${path === '/' ? '/' : path}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update or Insert OpenGraph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);

    // Update or Insert Schema.org JSON-LD Structured Data
    let schemaScript = document.getElementById('schema-ld-json');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-ld-json';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    const structuredData: {
      '@context': string;
      '@graph': Array<Record<string, unknown>>;
    } = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: seoItem ? `${seoItem.toolName} | 101 JSON Toolkit` : '101 JSON Toolkit',
          url: canonicalUrl,
          description: pageDescription,
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

    if (seoItem?.faqs?.items && seoItem.faqs.items.length > 0) {
      structuredData['@graph'].push({
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

    if (seoItem && path !== '/') {
      structuredData['@graph'].push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://101jsontoolkit.netlify.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: seoItem.toolName,
            item: canonicalUrl,
          },
        ],
      });
    }

    schemaScript.textContent = JSON.stringify(structuredData);
  }, [path]);

  // Route Dispatcher
  const renderCurrentPage = () => {
    switch (path) {
      case '/':
        return <LandingPage />;
      case '/json-formatter':
        return <JsonFormatterPage onShowToast={addToast} />;
      case '/json-validator':
        return <JsonValidatorPage onShowToast={addToast} />;
      case '/json-viewer':
        return <JsonViewerPage onShowToast={addToast} />;
      case '/json-minifier':
        return <JsonMinifierPage onShowToast={addToast} />;
      case '/json-compare':
        return <JsonComparePage onShowToast={addToast} />;
      case '/jsonpath':
        return <JsonPathPage onShowToast={addToast} />;
      case '/json-schema':
        return <JsonSchemaPage onShowToast={addToast} />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D13] text-slate-100 flex flex-col font-sans selection:bg-[#38BDF8]/30">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1 flex flex-col">{renderCurrentPage()}</main>

      {/* Footer */}
      <Footer />

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
