import React from 'react';
import { Link } from '../router';
import { Braces, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0D13] border-t border-[#1A202C] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Privacy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#121620] border border-[#262D3D] flex items-center justify-center text-[#38BDF8]">
                <Braces className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">JSON Toolkit</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard-compliant, high-performance developer utilities for formatting, inspecting, validating, and comparing JSON payloads.
            </p>
            <Link
              to="/privacy"
              className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500/60 transition-colors rounded-md p-2 group"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Client-side. Zero payload transmission.</span>
            </Link>
          </div>

          {/* Col 2: Core Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Core Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/json-formatter" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link to="/json-validator" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSON Validator
                </Link>
              </li>
              <li>
                <Link to="/json-viewer" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSON Tree Viewer
                </Link>
              </li>
              <li>
                <Link to="/json-minifier" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSON Minifier & Compressor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Advanced Utilities */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Advanced Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/json-compare" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSON Compare & Diff
                </Link>
              </li>
              <li>
                <Link to="/jsonpath" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSONPath Query Evaluator
                </Link>
              </li>
              <li>
                <Link to="/json-schema" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  JSON Schema Validator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Transparency & Specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-[#38BDF8] transition-colors">
                  Contact & Feedback
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 font-mono">
                Adheres to RFC 8259 & RFC 9535
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-[#1A202C] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JSON Toolkit. All utilities run locally in your web browser.</p>
          <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
            <Link to="/about" className="hover:text-slate-300">
              About
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300">
              Contact & Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
