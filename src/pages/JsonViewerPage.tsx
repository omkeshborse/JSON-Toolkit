import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { JsonEngine } from '../utils/jsonEngine';
import {
  Eye,
  RotateCcw,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Hash,
  Type,
  ToggleLeft,
  Brackets,
  Folder,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

export const JsonViewerPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [undoText, setUndoText] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  // Validate using shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(jsonText);
  }, [jsonText]);

  const { isValid, data: parsedData, error, line, diagnostics, candidate } = validation;

  const handleApplySmartFix = (fixedText: string) => {
    setUndoText(jsonText);
    setJsonText(fixedText);
    onShowToast('Deterministic Smart Fix applied: Converted to valid RFC 8259 JSON', 'success');
  };

  const handleUndoFix = () => {
    if (undoText !== null) {
      setJsonText(undoText);
      setUndoText(null);
      onShowToast('Reverted to original JSON', 'info');
    }
  };

  const handleResetSample = () => {
    setJsonText(JSON.stringify(SAMPLE_DATASETS[0].data, null, 2));
    setUndoText(null);
    onShowToast('Loaded sample dataset', 'info');
  };

  const handleClear = () => {
    setJsonText('');
    setUndoText(null);
    onShowToast('Cleared JSON editor', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Viewer' }]} />

      <ToolHeader
        title="JSON Tree Viewer"
        description="Inspect, explore, search, and navigate nested JSON structures with interactive branch expansion."
        icon={Eye}
        badge="Tree Explorer"
        actions={
          <>
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

      {/* Smart Fix Banner when errors detected */}
      {!isValid && jsonText.trim() && (
        <div className="mb-4">
          <SmartFixBanner
            diagnostics={diagnostics}
            candidate={candidate}
            rawInput={jsonText}
            onApplyFix={handleApplySmartFix}
            onUndoFix={handleUndoFix}
            canUndo={undoText !== null}
          />
        </div>
      )}

      {/* Undo Banner if currently fixed */}
      {isValid && undoText !== null && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Smart Fix active. Document is valid RFC 8259 JSON.</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left: Raw JSON Input Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-[460px]">
          <CodeEditor
            title="JSON Source"
            value={jsonText}
            onChange={(val) => {
              setJsonText(val);
              if (undoText !== null) setUndoText(null);
            }}
            placeholder="Paste JSON to explore..."
            error={error}
            errorLine={line}
            diagnostics={diagnostics}
            canSmartFix={Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')}
            onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
          />
        </div>

        {/* Right: Interactive Tree View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#121620] border border-[#1A202C] rounded-xl overflow-hidden shadow-xl min-h-[460px]">
          {/* Tree Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0B0D13]/70 border-b border-[#1A202C]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
              <span className="font-semibold text-xs text-white">Interactive Tree View</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search filter */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter keys/values..."
                  className="bg-[#0B0D13] border border-[#262D3D] rounded-md pl-7 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#38BDF8] w-40 font-mono"
                />
              </div>

              {/* Expand / Collapse All */}
              <button
                onClick={() => setExpandAll(!expandAll)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 border border-[#262D3D] transition-colors cursor-pointer"
              >
                {expandAll ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          </div>

          {/* Tree Body */}
          <div className="flex-1 p-4 overflow-auto font-mono text-xs max-h-[680px]">
            {!isValid || parsedData === null ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16">
                <Eye className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-xs font-sans text-slate-400">
                  {error || 'Enter valid JSON to view interactive tree'}
                </p>
              </div>
            ) : (
              <TreeNode
                keyName="root"
                value={parsedData}
                level={0}
                expandAll={expandAll}
                searchTerm={searchTerm}
                path="$"
                onShowToast={onShowToast}
              />
            )}
          </div>
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-viewer']} />
    </div>
  );
};

// Recursive Tree Node Renderer
interface TreeNodeProps {
  keyName: string;
  value: any;
  level: number;
  expandAll: boolean;
  searchTerm: string;
  path: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  level,
  expandAll,
  searchTerm,
  path,
  onShowToast,
}) => {
  const [isOpen, setIsOpen] = useState(expandAll);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setIsOpen(expandAll);
  }, [expandAll]);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const copyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopied(true);
    onShowToast(`Copied path: ${path}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (keyName.toLowerCase().includes(term)) return true;
    if (!isObject && String(value).toLowerCase().includes(term)) return true;
    return false;
  }, [searchTerm, keyName, value, isObject]);

  if (!matchesSearch && !isObject) {
    return null;
  }

  const getTypeBadge = () => {
    if (value === null) return <span className="text-slate-500 italic">null</span>;
    if (typeof value === 'boolean') return <span className="text-purple-400 font-semibold">{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-amber-400">{value}</span>;
    if (typeof value === 'string') return <span className="text-emerald-400 truncate max-w-xs inline-block align-bottom">"{value}"</span>;
    if (isArray) return <span className="text-blue-400 font-semibold">Array[{value.length}]</span>;
    return <span className="text-[#38BDF8] font-semibold">Object{`{${Object.keys(value).length}}`}</span>;
  };

  return (
    <div className="select-none" style={{ marginLeft: `${level * 16}px` }}>
      <div
        onClick={() => isObject && setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-[#1A202C]/60 transition-colors ${
          isObject ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {isObject ? (
          <span className="text-slate-500 hover:text-white transition-colors">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        <span className="text-slate-300 font-semibold">{keyName !== 'root' ? `"${keyName}":` : ''}</span>
        <span className="text-xs">{getTypeBadge()}</span>

        <button
          onClick={copyPath}
          title={`Copy JSONPath: ${path}`}
          className="opacity-0 group-hover:opacity-100 ml-auto p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {isObject && isOpen && (
        <div className="border-l border-[#1A202C] ml-2">
          {Object.entries(value).map(([k, v]) => {
            const nextPath = isArray ? `${path}[${k}]` : `${path}.${k}`;
            return (
              <TreeNode
                key={k}
                keyName={k}
                value={v}
                level={level + 1}
                expandAll={expandAll}
                searchTerm={searchTerm}
                path={nextPath}
                onShowToast={onShowToast}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
