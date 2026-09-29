import React, { useState, useCallback, useEffect } from 'react';
import { RouterProvider, useRouter } from './router';
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

import { WorkspaceProvider } from './context/WorkspaceContext';
import { applyRouteHead } from './seo/applyHead';

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
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </RouterProvider>
  );
}
