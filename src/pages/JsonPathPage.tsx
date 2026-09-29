import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { evaluateJsonPath } from '../utils/jsonpath';
import { JsonEngine } from '../utils/jsonEngine';
import { useWorkspace } from '../context/WorkspaceContext';
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
  Sparkles,
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
  const {
    activeTab,
    activeTabId,
    updateActiveTab,
    workspaceMode,
  } = useWorkspace();

  const [query, setQuery] = useState<string>('$.store.book[*]');
  const [viewMode, setViewMode] = useState<'raw' | 'table'>('raw');
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Validate active tab using shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(activeTab.inputJson);
  }, [activeTab.inputJson]);

  const { isValid, data: parsedData, error: syntaxError, line, diagnostics, candidate } = validation;

  // Evaluate JSONPath on active document
  const result = useMemo(() => {
    if (!activeTab.inputJson.trim()) {
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
  }, [activeTab.inputJson, query, parsedData, isValid]);

  const handleApplySmartFix = (fixedText: string) => {
    updateActiveTab({
      undoInput: activeTab.inputJson,
      inputJson: fixedText,
      isDirty: true,
    });
    onShowToast('Deterministic Smart Fix applied: Converted to valid RFC 8259 JSON', 'success');
  };

  const handleUndoFix = () => {
    if (activeTab.undoInput !== null) {
      updateActiveTab({
        inputJson: activeTab.undoInput,
        undoInput: null,
        isDirty: true,
      });
      onShowToast('Reverted to original JSON', 'info');
    }
  };

  const handleCopyResults = () => {
    if (!result.rawValues || result.rawValues.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(result.rawValues, null, 2));
    onShowToast('Copied JSONPath results to clipboard', 'success');
  };

  const handleResetSample = () => {
    updateActiveTab({
      inputJson: JSON.stringify(SAMPLE_DATASETS[0].data, null, 2),
      undoInput: null,
      isDirty: false,
    });
    setQuery('$.store.book[*]');
    onShowToast('Loaded bookstore sample dataset', 'info');
  };

  const handleClear = () => {
    updateActiveTab({
      inputJson: '',
      undoInput: null,
      isDirty: false,
    });
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

  const isFullscreen = workspaceMode === 'fullscreen';

  const formattedOutputText = useMemo(() => {
    if (result.error) return `// Evaluation Error:\n// ${result.error}`;
    if (!activeTab.inputJson.trim()) return '// Query results will appear here...';
    if (!result.rawValues || result.rawValues.length === 0) return '// No matches found for query: ' + query;
    return JSON.stringify(result.rawValues, null, 2);
  }, [result, activeTab.inputJson, query]);

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
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
      </div>

      <WorkspaceShell
        title="JSONPath Evaluator"
        onShowToast={onShowToast}
      >
        {/* Smart Fix Banner when errors detected */}
        {!isValid && activeTab.inputJson.trim() && (
          <div className="mb-4">
            <SmartFixBanner
              key={`smartfix-${activeTabId}`}
              diagnostics={diagnostics}
              candidate={candidate}
              rawInput={activeTab.inputJson}
              onApplyFix={handleApplySmartFix}
              onUndoFix={handleUndoFix}
              canUndo={activeTab.undoInput !== null}
            />
          </div>
        )}

        {/* Undo Banner if currently fixed */}
        {isValid && activeTab.undoInput !== null && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Deterministic Smart Fix active on &quot;{activeTab.title}&quot;. Document is valid RFC 8259 JSON.</span>
            </div>
            <button
              onClick={handleUndoFix}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Fix</span>
            </button>
          </div>
        )}

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
            <span className="text-slate-500 mr-1 text-[11px]">Presets:</span>
            {COMMON_QUERIES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setQuery(preset.query)}
                className="px-2 py-0.5 rounded bg-[#0B0D13] hover:bg-[#1A202C] text-slate-300 hover:text-white border border-[#262D3D] text-[11px] font-mono transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-side Equal-Height Editors/Panels Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          {/* Left: Input Editor */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`jsonpath-input-${activeTabId}`}
              title={`Source Document (${activeTab.title})`}
              value={activeTab.inputJson}
              onChange={(val) => {
                updateActiveTab({
                  inputJson: val,
                  undoInput: null,
                  isDirty: true,
                });
              }}
              placeholder="Paste JSON document to query..."
              error={syntaxError}
              errorLine={line}
              diagnostics={diagnostics}
              canSmartFix={Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')}
              onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
              heightClass="h-full"
            />
          </div>

          {/* Right: Results Panel */}
          <div className="w-full h-full min-h-0 flex flex-col">
            {viewMode === 'raw' || !isTableCompatible ? (
              <CodeEditor
                key={`jsonpath-output-${activeTabId}`}
                title={`Matches: ${result.rawValues?.length || 0} items`}
                value={formattedOutputText}
                readOnly
                placeholder="Matches will appear here..."
                heightClass="h-full"
                extraActions={
                  isTableCompatible ? (
                    <button
                      onClick={() => setViewMode('table')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D] text-xs transition-colors cursor-pointer"
                      title="Switch to table view"
                    >
                      <TableIcon className="w-3 h-3 text-[#38BDF8]" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                  ) : null
                }
              />
            ) : (
              <div className="flex flex-col bg-[#0F1117] border border-[#262D3D] rounded-xl overflow-hidden shadow-xl h-full min-h-0">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#121620] border-b border-[#1A202C] text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">Table View</span>
                    <span className="text-slate-500 font-mono text-[11px]">{result.rawValues.length} rows</span>
                  </div>
                  <button
                    onClick={() => setViewMode('raw')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D] text-xs transition-colors cursor-pointer"
                  >
                    <Code className="w-3 h-3 text-[#38BDF8]" />
                    <span>Raw JSON</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4 min-h-0">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#262D3D] text-slate-400 font-mono text-[11px]">
                        <th className="pb-2 pr-4 font-semibold">#</th>
                        {tableHeaders.map((head) => (
                          <th key={head} className="pb-2 pr-4 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A202C] text-slate-300 font-mono text-xs">
                      {result.rawValues.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#161B26] transition-colors">
                          <td className="py-2 pr-4 text-slate-500">{idx + 1}</td>
                          {tableHeaders.map((col) => (
                            <td key={col} className="py-2 pr-4 truncate max-w-xs">
                              {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </WorkspaceShell>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SeoContentSection content={SEO_DATA_BY_PATH['/jsonpath']} />
      </div>
    </div>
  );
};
export default JsonPathPage;
