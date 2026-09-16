import React, { useState } from 'react';
import { Link, useRouter } from '../router';
import {
  Braces,
  CheckCircle2,
  Eye,
  Minimize2,
  GitCompare,
  Search,
  FileCode2,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { path } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTools = [
    { to: '/json-formatter', label: 'Formatter', icon: Braces },
    { to: '/json-validator', label: 'Validator', icon: CheckCircle2 },
    { to: '/json-viewer', label: 'Viewer', icon: Eye },
    { to: '/json-minifier', label: 'Minifier', icon: Minimize2 },
    { to: '/json-compare', label: 'Compare', icon: GitCompare },
    { to: '/jsonpath', label: 'JSONPath', icon: Search },
    { to: '/json-schema', label: 'Schema', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0D13]/95 backdrop-blur-md border-b border-[#1A202C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#121620] border border-[#262D3D] flex items-center justify-center text-[#38BDF8] group-hover:border-[#38BDF8]/50 transition-colors">
            <Braces className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              JSON Toolkit
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Developer Utilities
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = path === tool.to;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-[#121620] text-[#38BDF8] border border-[#262D3D]'
                    : 'text-slate-300 hover:text-white hover:bg-[#121620]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-[#121620] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B0D13] border-b border-[#1A202C] px-4 pt-2 pb-6 space-y-3">
          <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider pt-2">
            Tools
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {mainTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded text-xs font-medium ${
                    path === tool.to
                      ? 'bg-[#121620] text-[#38BDF8] border border-[#262D3D]'
                      : 'text-slate-300 hover:bg-[#121620]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
