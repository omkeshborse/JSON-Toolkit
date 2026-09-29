import React, { useState } from 'react';
import { Link } from '../router';
import {
  Braces,
  CheckCircle2,
  Eye,
  Minimize2,
  GitCompare,
  Search,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Code2,
  Copy,
  Check,
} from 'lucide-react';

const PREVIEW_SAMPLE = `{
  "product": "JSON Toolkit",
  "version": "1.0.0",
  "status": "ready",
  "features": [
    "Formatting & Indentation",
    "RFC 8259 Syntax Validation",
    "JSONPath RFC 9535 Queries",
    "JSON Schema Ajv Validation",
    "Deep Object Diffing",
    "Visual Tree Inspector"
  ],
  "security": {
    "clientSideOnly": true,
    "telemetry": false
  }
}`;

export const LandingPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [editorText, setEditorText] = useState(PREVIEW_SAMPLE);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(editorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    {
      title: 'JSON Formatter',
      description: 'Prettify and beautify messy JSON with custom indentation (2-spaces, 4-spaces, tabs) and syntax validation.',
      to: '/json-formatter',
      icon: Braces,
      badge: 'Core',
      badgeColor: 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20',
    },
    {
      title: 'JSON Validator',
      description: 'Strict RFC 8259 syntax checker with exact line, column, and token diagnostic reporting.',
      to: '/json-validator',
      icon: CheckCircle2,
      badge: 'RFC 8259',
      badgeColor: 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20',
    },
    {
      title: 'JSON Tree Viewer',
      description: 'Interactive collapsible tree explorer with path breadcrumbs, node search, and quick value copying.',
      to: '/json-viewer',
      icon: Eye,
      badge: 'Inspector',
      badgeColor: 'text-[#A78BFA] bg-[#A78BFA]/10 border-[#A78BFA]/20',
    },
    {
      title: 'JSON Minifier',
      description: 'Strip all extraneous whitespace, linebreaks, and formatting to minimize payload byte size for production APIs.',
      to: '/json-minifier',
      icon: Minimize2,
      badge: 'Compress',
      badgeColor: 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20',
    },
    {
      title: 'JSON Compare',
      description: 'Deep structural diff engine comparing two JSON payloads to detect additions, removals, and modifications.',
      to: '/json-compare',
      icon: GitCompare,
      badge: 'Diff Tool',
      badgeColor: 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20',
    },
    {
      title: 'JSONPath Evaluator',
      description: 'Query, filter, and extract nested elements using standard RFC 9535 JSONPath expressions.',
      to: '/jsonpath',
      icon: Search,
      badge: 'RFC 9535',
      badgeColor: 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20',
    },
    {
      title: 'JSON Schema Validator',
      description: 'Validate complex JSON payloads against Draft-07 and 2020-12 specifications using the standard Ajv engine.',
      to: '/json-schema',
      icon: FileCode2,
      badge: 'Ajv Engine',
      badgeColor: 'text-[#A78BFA] bg-[#A78BFA]/10 border-[#A78BFA]/20',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-[#1A202C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121620] border border-[#262D3D] text-[#38BDF8] text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                <span>100% Client-Side • Zero Telemetry • Open Specs</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Free Online JSON Tools for Developers
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Format, validate, query with JSONPath, inspect schemas, and compare diffs directly in your browser. Fast, private, and built for modern developers.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/json-formatter"
                  className="px-5 py-3 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#38BDF8]/10"
                >
                  <span>Open JSON Formatter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#tools-grid"
                  className="px-5 py-3 rounded-lg bg-[#121620] hover:bg-[#1A202C] text-white border border-[#262D3D] font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <span>Explore Tools</span>
                </a>

                <Link
                  to="/json-validator"
                  className="px-4 py-3 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Validate Syntax →
                </Link>
              </div>

              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#1A202C] max-w-lg">
                <div>
                  <div className="text-xl font-bold text-white font-mono">7</div>
                  <div className="text-xs text-slate-400">Dedicated Tools</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#34D399] font-mono">0ms</div>
                  <div className="text-xs text-slate-400">Network Latency</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#38BDF8] font-mono">100%</div>
                  <div className="text-xs text-slate-400">Local Privacy</div>
                </div>
              </div>
            </div>

            {/* Hero Right Code Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#121620] border border-[#262D3D] shadow-2xl overflow-hidden">
                <div className="px-4 py-3 bg-[#0B0D13]/80 border-b border-[#1A202C] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400">payload.json</span>
                  </div>
                  <button
                    onClick={handleCopyPreview}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <pre className="text-slate-300">
                    <code>{editorText}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools-grid" className="py-20 bg-[#0B0D13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A Complete Developer Suite for JSON Operations
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Each tool is precision-engineered for speed, privacy, and full conformance to open standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="group relative p-6 rounded-2xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-[#38BDF8]/5 text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#1A202C] border border-[#262D3D] flex items-center justify-center text-[#38BDF8] group-hover:scale-105 group-hover:border-[#38BDF8]/50 transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors flex items-center gap-2">
                        {tool.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1A202C] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-[#38BDF8] transition-colors">
                    <span>Launch Utility</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why 101 JSON Toolkit Section */}
      <section className="py-20 border-t border-[#1A202C] bg-[#0E1118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#121620] border border-[#1A202C] space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#34D399]/10 text-[#34D399] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Guaranteed Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                All JSON operations happen entirely in your browser memory. No data, API keys, or payloads are ever uploaded to a remote server.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121620] border border-[#1A202C] space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Latency</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Zero network roundtrips means multi-megabyte payloads format, minify, and validate without lag or loading spinners.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121620] border border-[#1A202C] space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Standard Compliant</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Strict adherence to RFC 8259 (JSON Grammar), RFC 9535 (JSONPath specification), and JSON Schema Draft-07 standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
