import React from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { GUIDES_DATA } from '../data/guidesContent';
import { Link } from '../router';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  GitCompare,
  Braces,
  FileCode2,
  Eye,
  Minimize2,
} from 'lucide-react';

export const GuidesIndexPage: React.FC = () => {
  const guidesList = Object.values(GUIDES_DATA);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Guides' }]} />

      {/* Header */}
      <header className="mb-12 pb-8 border-b border-[#1A202C] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121620] border border-[#262D3D] text-[#38BDF8] text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Product-Led Engineering Tutorials</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Technical JSON Guides & Tutorials
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          In-depth technical guides for debugging JSON syntax errors, comparing JSON objects independent of key order, and querying nested API responses with JSONPath.
        </p>
      </header>

      {/* Guides Grid */}
      <section aria-labelledby="featured-guides-heading" className="mb-16">
        <h2 id="featured-guides-heading" className="sr-only">
          Featured Developer Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guidesList.map((guide, idx) => (
            <article
              key={guide.slug}
              className="p-6 rounded-2xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                    Guide 0{idx + 1}
                  </span>
                  <span>{guide.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors leading-snug">
                  <Link to={guide.route}>{guide.h1}</Link>
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {guide.metaDescription}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">
                    Key Topics Covered:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.supportingKeywords.slice(0, 3).map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#161C28] text-slate-300 border border-[#262D3D]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1A202C]">
                <Link
                  to={guide.route}
                  className="flex items-center justify-between text-sm font-semibold text-[#38BDF8] group-hover:text-white transition-colors"
                >
                  <span>Read Full Technical Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Core Tool Workbenches Hub */}
      <section aria-labelledby="tools-hub-heading" className="p-8 rounded-2xl bg-[#0F141E] border border-[#262D3D]">
        <div className="mb-6 space-y-2">
          <h2 id="tools-hub-heading" className="text-2xl font-bold text-white tracking-tight">
            Interactive JSON Developer Tools
          </h2>
          <p className="text-sm text-slate-400">
            Every technical guide is backed by our suite of 100% client-side, browser-based utilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link
            to="/json-formatter"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#38BDF8] mb-2">
              <Braces className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                JSON Formatter & Beautifier
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Free online JSON formatter and JSON beautifier to format JSON online and pretty print JSON with custom tabs or spaces.
            </p>
          </Link>

          <Link
            to="/json-validator"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#34D399]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#34D399] mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#34D399] transition-colors">
                JSON Syntax Validator
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JSON validator online, json syntax checker, and RFC 8259 validator to check syntax, inspect errors, and fix JSON syntax errors with deterministic Smart Fix.
            </p>
          </Link>

          <Link
            to="/json-viewer"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#A78BFA]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#A78BFA] mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                JSON Tree Viewer
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JSON tree viewer online and interactive JSON viewer to visualize JSON tree nodes in a responsive, collapsible JSON viewer.
            </p>
          </Link>

          <Link
            to="/json-minifier"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#FBBF24]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#FBBF24] mb-2">
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#FBBF24] transition-colors">
                JSON Minifier
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JSON minifier to compress JSON online, compact JSON data, and remove whitespace from JSON payloads for optimized network transmission.
            </p>
          </Link>

          <Link
            to="/json-compare"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#38BDF8] mb-2">
              <GitCompare className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                JSON Compare & Diff
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JSON compare online tool: compare two JSON files online with our JSON diff tool and semantic JSON diff engine ignoring object key order.
            </p>
          </Link>

          <Link
            to="/jsonpath"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#34D399]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#34D399] mb-2">
              <Search className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#34D399] transition-colors">
                JSONPath Evaluator
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JSONPath tester and JSONPath evaluator online: test JSONPath query expressions with verified JSONPath query examples.
            </p>
          </Link>

          <Link
            to="/json-schema"
            className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#A78BFA]/40 transition group"
          >
            <div className="flex items-center gap-2 text-[#A78BFA] mb-2">
              <FileCode2 className="w-4 h-4" />
              <span className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                JSON Schema Validator
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              JSON Schema validator online to validate JSON Schema Draft 7 specifications using the standard Ajv JSON Schema validator.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default GuidesIndexPage;
