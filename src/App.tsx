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
      : 'JSON Toolkit — Client-Side Developer Utilities for JSON';
    const pageDescription = seoItem
      ? seoItem.metaDescription
      : 'Comprehensive client-side JSON developer toolkit for formatting, validating, inspecting, minifying, comparing, and querying JSON documents. 100% private.';

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

    // Update OpenGraph URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const currentUrl = window.location.origin + path;
    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl);
    }

    // Update or Insert Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);
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
        return <LandingPage />;
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
