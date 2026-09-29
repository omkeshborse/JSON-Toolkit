import React from 'react';
import { RouteHeadData } from './routeHead';
import { SeoContentSection } from '../components/SeoContentSection';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LandingPage } from '../pages/LandingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RouterProvider } from '../router';

interface StaticPageProps {
  routeHead: RouteHeadData;
}

/**
 * StaticPage component rendered at build-time to produce clean, crawler-ready HTML.
 * Wraps the route with Navbar, H1, introductory text, existing rich SEO content (guides, FAQs, internal links), and Footer.
 */
export const StaticPage: React.FC<StaticPageProps> = ({ routeHead }) => {
  const { path, h1, description, seoContent } = routeHead;

  return (
    <RouterProvider>
      <div className="min-h-screen bg-[#0B0D13] text-slate-100 flex flex-col font-sans selection:bg-[#38BDF8]/30">
        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {path === '/' ? (
            <LandingPage />
          ) : path === '404' || !seoContent ? (
            <NotFoundPage />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              {/* Semantic Heading & Intro for Crawlers and Initial Display */}
              <div className="mb-6 space-y-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {h1}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Editor Workspace Placeholder for prerendered snapshot */}
              <div
                className="w-full h-80 rounded-xl bg-[#121620] border border-[#262D3D] flex flex-col items-center justify-center p-6 text-center text-slate-400 my-6 shadow-inner"
                aria-label="Interactive JSON Editor loading container"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1A202C] border border-[#262D3D] flex items-center justify-center text-[#38BDF8] mb-3">
                  <span className="font-mono font-bold text-lg">{`{ }`}</span>
                </div>
                <h2 className="text-base font-semibold text-slate-200">
                  {routeHead.title.split('|')[0].trim()}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Fast, client-side, zero-telemetry JSON tool with real-time formatting, RFC 8259 syntax validation, and multi-tab workspace.
                </p>
              </div>

              {/* Comprehensive SEO Documentation, Step-by-Step Guide, Code Examples, FAQs, & Related Tools */}
              <SeoContentSection content={seoContent} />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </RouterProvider>
  );
};
