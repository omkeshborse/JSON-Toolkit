import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { RouterProvider, useRouter } from './router';
import { ToastMessage } from './types';
import { Toast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Homepage is loaded eagerly for instant, zero-delay hero rendering
import { LandingPage } from './pages/LandingPage';

// Lazy-load interactive tool workbenches and secondary pages on demand.
// This prevents heavy packages (Ajv, jsonpath-plus) from bloating the homepage and other routes.
const JsonFormatterPage = lazy(() => import('./pages/JsonFormatterPage'));
const JsonValidatorPage = lazy(() => import('./pages/JsonValidatorPage'));
const JsonViewerPage = lazy(() => import('./pages/JsonViewerPage'));
const JsonMinifierPage = lazy(() => import('./pages/JsonMinifierPage'));
const JsonComparePage = lazy(() => import('./pages/JsonComparePage'));
const JsonPathPage = lazy(() => import('./pages/JsonPathPage'));
const JsonSchemaPage = lazy(() => import('./pages/JsonSchemaPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const GuidesIndexPage = lazy(() => import('./pages/GuidesIndexPage'));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage'));
import { GUIDES_DATA } from './data/guidesContent';

import { WorkspaceProvider } from './context/WorkspaceContext';
import { applyRouteHead } from './seo/applyHead';

/**
 * Layout-stable fallback to eliminate Cumulative Layout Shift (CLS) during route hydration.
 */
function RouteLoadingFallback({ path }: { path: string }) {
  const isTool = path.startsWith('/json');

  if (isTool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
        <div className="w-full min-h-[440px] h-[clamp(440px,58vh,680px)] rounded-xl bg-[#121620] border border-[#262D3D] flex flex-col items-center justify-center p-6 text-center text-slate-400 my-6 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-[#1A202C] border border-[#262D3D] flex items-center justify-center text-[#38BDF8] mb-3">
            <span className="font-mono font-bold text-lg">{`{ }`}</span>
          </div>
          <span className="text-sm font-medium text-slate-300">Loading Tool Workbench...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-pulse">
      <div className="h-8 bg-[#121620] rounded-lg w-48 mb-4 border border-[#1A202C]" />
      <div className="h-4 bg-[#121620] rounded w-full max-w-md mb-8 border border-[#1A202C]" />
      <div className="space-y-4">
        <div className="h-24 bg-[#121620] rounded-xl border border-[#1A202C]" />
        <div className="h-24 bg-[#121620] rounded-xl border border-[#1A202C]" />
      </div>
    </div>
  );
}

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

  // Update dynamic page head, canonical link, social tags, and JSON-LD on client navigation
  useEffect(() => {
    applyRouteHead(path);
  }, [path]);

  // Route Dispatcher with Suspense boundary
  const renderCurrentPage = () => {
    if (path === '/') {
      return <LandingPage />;
    }

    return (
      <Suspense fallback={<RouteLoadingFallback path={path} />}>
        {(() => {
          switch (path) {
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
            case '/about':
              return <AboutPage />;
            case '/privacy':
              return <PrivacyPage />;
            case '/contact':
              return <ContactPage />;
            case '/guides':
              return <GuidesIndexPage />;
            default:
              if (path.startsWith('/guides/')) {
                const slug = path.replace('/guides/', '');
                const guide = GUIDES_DATA[slug];
                if (guide) {
                  return <GuideDetailPage guide={guide} />;
                }
              }
              return <NotFoundPage />;
          }
        })()}
      </Suspense>
    );
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
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </RouterProvider>
  );
}
