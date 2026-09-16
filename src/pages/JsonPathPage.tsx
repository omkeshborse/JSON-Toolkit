import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { evaluateJsonPath } from '../utils/jsonpath';
import {
  Search,
  Copy,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code,
  Table as TableIcon,
  Play,
} from 'lucide-react';

const COMMON_QUERIES = [
  { label: 'All Books', query: '$.store.book[*]' },
  { label: 'All Authors', query: '$..author' },
  { label: 'Books under $10', query: '$.store.book[?(@.price < 10)]' },
  { label: 'First Two Books', query: '$.store.book[0:2]' },
  { label: 'Bicycle Info', query: '$.store.bicycle' },
];

export const JsonPathPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [query, setQuery] = useState<string>('$');
  const [viewMode, setViewMode] = useState<'raw' | 'table'>('raw');
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Parse JSON
  const { parsedData, isValid, syntaxError } = useMemo(() => {
    if (!jsonText.trim()) {
      return { parsedData: null, isValid: false, syntaxError: null };
    }
    try {
      return { parsedData: JSON.parse(jsonText), isValid: true, syntaxError: null };
    } catch (err: any) {
      return { parsedData: null, isValid: false, syntaxError: err?.message || 'Invalid JSON syntax' };
    }
  }, [jsonText]);

  // Evaluate JSONPath
  const result = useMemo(() => {
    if (!jsonText.trim()) {
      return {
        matches: [],
        rawValues: [],
        error: null,
      };
    }
    if (!isValid || parsedData === null) {
      return {
        matches: [],
        rawValues: [],
        error: 'JSON document has syntax errors; cannot evaluate JSONPath.',
      };
    }
    return evaluateJsonPath(query, parsedData);
  }, [jsonText, query, parsedData, isValid]);

  const handleCopyResults = () => {
    if (!result.rawValues || result.rawValues.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(result.rawValues, null, 2));
    onShowToast('Copied JSONPath results to clipboard', 'success');
  };

  const handleResetSample = () => {
    setJsonText(JSON.stringify(SAMPLE_DATASETS[0].data, null, 2));
    setQuery('$.store.book[*]');
    onShowToast('Loaded bookstore sample dataset', 'info');
  };

  const handleClear = () => {
    setJsonText('');
    setQuery('');
    onShowToast('Cleared input', 'info');
  };

  // Check if result is array of objects for table view
  const isTableCompatible = useMemo(() => {
    if (!Array.isArray(result.rawValues) || result.rawValues.length === 0) return false;
    return result.rawValues.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
  }, [result.rawValues]);

  const tableHeaders = useMemo(() => {
    if (!isTableCompatible) return [];
    const keys = new Set<string>();
    result.rawValues.forEach((obj: any) => {
      Object.keys(obj).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [isTableCompatible, result.rawValues]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSONPath' }]} />

      <ToolHeader
        title="JSONPath Query Evaluator"
        description="Extract and query elements from JSON documents using standard RFC 9535 syntax."
        icon={Search}
        badge="RFC 9535"
        actions={
          <>
            <button
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Syntax Guide</span>
            </button>
            <button
              onClick={handleResetSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </>
        }
      />

      {/* Syntax Guide Panel */}
      {showCheatSheet && (
        <div className="mb-4 p-4 rounded-xl bg-[#121620] border border-[#262D3D] text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1A202C]">
            <span className="font-semibold text-white">JSONPath Syntax Reference (RFC 9535)</span>
            <button
              onClick={() => setShowCheatSheet(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-[#0B0D13] border border-[#1A202C]">
              <span className="text-[#38BDF8] font-bold">$</span>
              <span className="text-slate-300 ml-2">Root object / element</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0D13] border border-[#1A202C]">
              <span className="text-[#38BDF8] font-bold">@</span>
              <span className="text-slate-300 ml-2">Current element being evaluated</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0D13] border border-[#1A202C]">
              <span className="text-[#38BDF8] font-bold">*</span>
              <span className="text-slate-300 ml-2">Wildcard (all properties/elements)</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0D13] border border-[#1A202C]">
              <span className="text-[#38BDF8] font-bold">..</span>
              <span className="text-slate-300 ml-2">Recursive descent (deep search)</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0D13] border border-[#1A202C]">
              <span className="text-[#38BDF8] font-bold">[start:end]</span>
              <span className="text-slate-300 ml-2">Array slice operator</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0D13] border border-[#1A202C]">
              <span className="text-[#38BDF8] font-bold">[?(@.price &lt; 10)]</span>
              <span className="text-slate-300 ml-2">Filter expression</span>
            </div>
          </div>
        </div>
      )}

      {/* Query Bar */}
      <div className="p-3 rounded-xl bg-[#121620] border border-[#1A202C] mb-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">JSONPath:</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. $.store.book[*]"
              className="w-full bg-[#0B0D13] border border-[#262D3D] rounded-lg pl-24 pr-4 py-2 text-xs font-mono text-[#38BDF8] focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <button
            onClick={handleCopyResults}
            disabled={!result.rawValues || result.rawValues.length === 0}
            className="px-3.5 py-2 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Matches</span>
          </button>
        </div>

        {/* Quick query presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px]">Quick Queries:</span>
          {COMMON_QUERIES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setQuery(preset.query)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                query === preset.query
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30'
                  : 'bg-[#0B0D13] text-slate-400 hover:text-white border border-[#262D3D]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left JSON Source, Right Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Source Payload (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-[460px]">
          <CodeEditor
            title="Source Payload"
            value={jsonText}
            onChange={setJsonText}
            placeholder="Paste JSON document..."
            error={syntaxError}
          />
        </div>

        {/* Right Column: Query Results (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#121620] border border-[#1A202C] rounded-xl overflow-hidden shadow-xl min-h-[460px]">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0B0D13]/70 border-b border-[#1A202C]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Query Results</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  result.error
                    ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30'
                    : 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30'
                }`}
              >
                {result.error ? 'Error' : `${result.matches.length} matches`}
              </span>
            </div>

            {/* View Mode Toggle */}
            {isTableCompatible && (
              <div className="flex items-center bg-[#0B0D13] p-0.5 rounded border border-[#262D3D]">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                    viewMode === 'raw' ? 'bg-[#121620] text-white' : 'text-slate-400'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                    viewMode === 'table' ? 'bg-[#121620] text-white' : 'text-slate-400'
                  }`}
                >
                  <TableIcon className="w-3 h-3" />
                  <span>Table</span>
                </button>
              </div>
            )}
          </div>

          {/* Result Content */}
          <div className="flex-1 p-4 overflow-auto font-mono text-xs">
            {result.error ? (
              <div className="p-3 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E]">
                <div className="flex items-center gap-2 font-semibold font-sans mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>JSONPath Error</span>
                </div>
                <p className="text-xs font-mono">{result.error}</p>
              </div>
            ) : result.matches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 font-sans">
                <Search className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs text-slate-400">No nodes matched the given JSONPath query</p>
                <span className="text-[11px] text-slate-600 font-mono mt-1">{query}</span>
              </div>
            ) : viewMode === 'table' && isTableCompatible ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#262D3D] text-slate-400 bg-[#0B0D13]">
                      <th className="p-2 font-semibold">#</th>
                      {tableHeaders.map((header) => (
                        <th key={header} className="p-2 font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A202C]">
                    {result.rawValues.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1A202C]/50">
                        <td className="p-2 text-slate-500">{idx + 1}</td>
                        {tableHeaders.map((header) => (
                          <td key={header} className="p-2 text-slate-300 whitespace-nowrap">
                            {typeof row[header] === 'object'
                              ? JSON.stringify(row[header])
                              : String(row[header] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre className="text-[#38BDF8] leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(result.rawValues, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/jsonpath']} />
    </div>
  );
};
