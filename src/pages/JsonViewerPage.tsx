import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
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
} from 'lucide-react';

export const JsonViewerPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  const { parsedData, isValid, error } = useMemo(() => {
    if (!jsonText.trim()) {
      return { parsedData: null, isValid: false, error: null };
    }
    try {
      const p = JSON.parse(jsonText);
      return { parsedData: p, isValid: true, error: null };
    } catch (err: any) {
      return { parsedData: null, isValid: false, error: err?.message || 'Invalid JSON syntax' };
    }
  }, [jsonText]);

  const handleResetSample = () => {
    setJsonText(JSON.stringify(SAMPLE_DATASETS[0].data, null, 2));
    onShowToast('Loaded sample dataset', 'info');
  };

  const handleClear = () => {
    setJsonText('');
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left: Raw JSON Input Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-[460px]">
          <CodeEditor
            title="JSON Source"
            value={jsonText}
            onChange={setJsonText}
            placeholder="Paste JSON to explore..."
            error={error}
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
                path="$"
                searchTerm={searchTerm}
                defaultExpanded={expandAll}
                depth={0}
                onCopy={(text, label) => onShowToast(`Copied ${label}`, 'success')}
              />
            )}
          </div>
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-viewer']} />
    </div>
  );
};

interface TreeNodeProps {
  keyName: string;
  value: any;
  path: string;
  searchTerm: string;
  defaultExpanded: boolean;
  depth: number;
  onCopy: (text: string, label: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  path,
  searchTerm,
  defaultExpanded,
  depth,
  onCopy,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedPath, setCopiedPath] = useState(false);

  React.useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  // Search matching
  const termLower = searchTerm.toLowerCase();
  const keyMatches = termLower ? keyName.toLowerCase().includes(termLower) : false;
  const valueMatches = termLower && !isObject ? String(value).toLowerCase().includes(termLower) : false;

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(str);
    onCopy(str, `value of "${keyName}"`);
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
    onCopy(path, `path "${path}"`);
  };

  if (searchTerm && !keyMatches && !valueMatches && !isObject) {
    return null;
  }

  return (
    <div className="py-0.5 select-text">
      <div
        className={`group flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-[#1A202C]/60 transition-colors ${
          keyMatches || valueMatches ? 'bg-[#38BDF8]/10 border border-[#38BDF8]/30' : ''
        }`}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        {isObject ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 h-3.5 inline-block" />
        )}

        {/* Key name */}
        <span className="font-semibold text-slate-300">
          {keyName}
          <span className="text-slate-500 font-normal">: </span>
        </span>

        {/* Type / Value Rendering */}
        {isObject ? (
          <span className="text-slate-500 text-[11px]">
            {isArray ? `Array [${value.length}]` : `Object {${Object.keys(value).length}}`}
          </span>
        ) : (
          <span
            className={`${
              typeof value === 'string'
                ? 'text-[#34D399]'
                : typeof value === 'number'
                ? 'text-[#38BDF8]'
                : typeof value === 'boolean'
                ? 'text-[#FBBF24]'
                : 'text-slate-500 italic'
            }`}
          >
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </span>
        )}

        {/* Hover action buttons: Copy Value, Copy Path */}
        <div className="ml-auto hidden group-hover:flex items-center gap-1">
          <button
            onClick={handleCopyPath}
            title="Copy path"
            className="p-1 rounded hover:bg-[#262D3D] text-slate-400 hover:text-white text-[10px] flex items-center gap-0.5 cursor-pointer"
          >
            {copiedPath ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
            <span>Path</span>
          </button>
          <button
            onClick={handleCopyValue}
            title="Copy value"
            className="p-1 rounded hover:bg-[#262D3D] text-slate-400 hover:text-white text-[10px] cursor-pointer"
          >
            Copy Val
          </button>
        </div>
      </div>

      {/* Render children if object and expanded */}
      {isObject && isExpanded && (
        <div>
          {isArray
            ? value.map((item: any, idx: number) => (
                <TreeNode
                  key={idx}
                  keyName={`[${idx}]`}
                  value={item}
                  path={`${path}[${idx}]`}
                  searchTerm={searchTerm}
                  defaultExpanded={defaultExpanded}
                  depth={depth + 1}
                  onCopy={onCopy}
                />
              ))
            : Object.keys(value).map((childKey) => (
                <TreeNode
                  key={childKey}
                  keyName={childKey}
                  value={value[childKey]}
                  path={`${path}.${childKey}`}
                  searchTerm={searchTerm}
                  defaultExpanded={defaultExpanded}
                  depth={depth + 1}
                  onCopy={onCopy}
                />
              ))}
        </div>
      )}
    </div>
  );
};
