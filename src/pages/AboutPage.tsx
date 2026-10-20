import React from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Link } from '../router';
import {
  ShieldCheck,
  Cpu,
  Database,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Breadcrumb items={[{ label: 'About' }]} />

        {/* Header */}
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Browser-Based Developer Utilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            About 101 JSON Toolkit
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            101 JSON Toolkit is an open, private suite of developer utilities designed to format,
            validate, query, minify, and inspect JSON payloads entirely inside your browser.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-[#121620] border border-[#1A202C] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Client-Side Architecture</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every JSON parsing, formatting, repair, and schema evaluation operation executes
              exclusively within your local browser runtime. Your JSON data is never transmitted
              to any backend server, logging pipeline, or analytics service.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#121620] border border-[#1A202C] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Strict Standards Adherence</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our utilities strictly enforce international standards, including RFC 8259 (standard
              JSON text format), ECMA-404, RFC 9535 (JSONPath query expressions), and JSON Schema
              Draft-07 / 2020-12 specifications.
            </p>
          </div>
        </div>

        {/* Technical Architecture */}
        <section className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCode2 className="w-6 h-6 text-[#38BDF8]" />
            <span>How the Toolkit Is Built</span>
          </h2>
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
            <p>
              Many online JSON tools route user data through remote backend APIs to format or lint
              payloads. This introduces privacy risks when working with proprietary API responses,
              session tokens, database exports, or customer configuration files.
            </p>
            <p>
              101 JSON Toolkit was built with a privacy-first engineering philosophy using{' '}
              <strong className="text-white">Vite, React 19, and TypeScript</strong>, hosted as static
              assets on Netlify CDN:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Parsing & Validation:</strong> Powered by the browser's
                native <code className="text-[#38BDF8] bg-[#121620] px-1.5 py-0.5 rounded">JSON.parse()</code>{' '}
                coupled with a custom deterministic scanner that identifies exact line, column, and
                token diagnostics for syntax errors.
              </li>
              <li>
                <strong className="text-white">Formatting & Indentation:</strong> Powered by native{' '}
                <code className="text-[#38BDF8] bg-[#121620] px-1.5 py-0.5 rounded">JSON.stringify()</code>{' '}
                with support for 2-space, 4-space, and tab indentation conventions.
              </li>
              <li>
                <strong className="text-white">JSONPath Queries:</strong> Implemented via the{' '}
                <code className="text-[#38BDF8] bg-[#121620] px-1.5 py-0.5 rounded">jsonpath-plus</code>{' '}
                client-side library supporting RFC 9535 path matching and filtering.
              </li>
              <li>
                <strong className="text-white">Schema Validation:</strong> Evaluated in-memory using the{' '}
                <code className="text-[#38BDF8] bg-[#121620] px-1.5 py-0.5 rounded">ajv</code> validator,
                supporting JSON Schema Draft-07 and Draft 2020-12 without external server calls.
              </li>
              <li>
                <strong className="text-white">Local Workspace Persistence:</strong> Document tabs and
                panel layout ratios are saved directly to your browser's{' '}
                <code className="text-[#38BDF8] bg-[#121620] px-1.5 py-0.5 rounded">localStorage</code>{' '}
                so you do not lose in-flight edits on page refresh. To protect against browser quota
                limits, tab payloads exceeding 1.5MB are held in session memory rather than persisted.
              </li>
            </ul>
          </div>
        </section>

        {/* Known Limitations */}
        <section className="p-6 rounded-xl bg-[#121620] border border-[#262D3D] space-y-4 mb-12">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-white">Technical Boundaries & Known Limitations</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              Because all computation occurs on your local device, processing speed depends on your
              device's CPU and available browser memory:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                Extremely large JSON documents (typically above 50MB to 100MB depending on your
                browser's JavaScript heap) may experience UI stuttering during full DOM rendering.
              </li>
              <li>
                Our deterministic Smart Fix algorithm resolves unambiguous syntax mistakes (such as
                trailing commas, unquoted keys, single quotes, and Python literals). However, severe
                structural corruption (such as missing closing brackets in complex hierarchies) cannot
                be safely guessed by any automated tool and requires developer review.
              </li>
            </ul>
          </div>
        </section>

        {/* Navigation to Tools */}
        <section className="pt-8 border-t border-[#1A202C]">
          <h2 className="text-lg font-bold text-white mb-4">Explore the Toolkit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/json-formatter"
              className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white">JSON Formatter</h3>
              <p className="text-xs text-slate-400 mt-1">Beautify and indent payloads</p>
            </Link>
            <Link
              to="/json-validator"
              className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white">JSON Validator</h3>
              <p className="text-xs text-slate-400 mt-1">Strict RFC 8259 syntax checker</p>
            </Link>
            <Link
              to="/privacy"
              className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] hover:border-[#38BDF8]/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white">Privacy Policy</h3>
              <p className="text-xs text-slate-400 mt-1">Read our data processing policy</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
export default AboutPage;
