import React from 'react';
import { Link } from '../router';
import {
  Braces,
  CheckCircle2,
  Eye,
  Minimize2,
  GitCompare,
  Search,
  FileCode2,
  Home,
  ArrowLeft,
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const tools = [
    { to: '/json-formatter', name: 'JSON Formatter', icon: Braces, desc: 'Prettify and indent JSON payloads' },
    { to: '/json-validator', name: 'JSON Validator', icon: CheckCircle2, desc: 'Real-time RFC 8259 syntax validation' },
    { to: '/json-viewer', name: 'JSON Tree Viewer', icon: Eye, desc: 'Interactive hierarchical node tree explorer' },
    { to: '/json-minifier', name: 'JSON Minifier', icon: Minimize2, desc: 'Compress and strip whitespace' },
    { to: '/json-compare', name: 'JSON Compare', icon: GitCompare, desc: 'Semantic payload diff analyzer' },
    { to: '/jsonpath', name: 'JSONPath Evaluator', icon: Search, desc: 'Query and filter nested data' },
    { to: '/json-schema', name: 'Schema Tools', icon: FileCode2, desc: 'Generate and validate JSON Schema' },
  ];

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#121620] border border-[#262D3D] flex items-center justify-center text-[#38BDF8] mb-6">
        <span className="text-2xl font-black font-mono">404</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-8">
        The requested URL was not found on this server. Explore one of our developer tools below or return to the homepage.
      </p>

      <div className="flex items-center gap-3 mb-12">
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4 text-left">
          Available Developer Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-left">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className="p-3.5 rounded-lg bg-[#121620]/70 border border-[#262D3D] hover:border-[#38BDF8]/50 hover:bg-[#121620] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-[#38BDF8] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                    {tool.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {tool.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
