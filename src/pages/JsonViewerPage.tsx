import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { JsonEngine } from '../utils/jsonEngine';
import { useWorkspace } from '../context/WorkspaceContext';
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
  const {
    activeTab,
    activeTabId,
    updateActiveTab,
    workspaceMode,
  } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  // Validate using shared JsonEngine on active tab
  const validation = useMemo(() => {
    return JsonEngine.validate(activeTab.inputJson);
  }, [activeTab.inputJson]);

  const { isValid, data: parsedData, error, line, diagnostics, candidate } = validation;

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

  const handleResetSample = () => {
    updateActiveTab({
      inputJson: JSON.stringify(SAMPLE_DATASETS[0].data, null, 2),
      undoInput: null,
      isDirty: false,
    });
    onShowToast('Loaded sample dataset', 'info');
  };

  const handleClear = () => {
    updateActiveTab({
      inputJson: '',
      undoInput: null,
      isDirty: false,
    });
    onShowToast('Cleared JSON editor', 'info');
  };

  const isFullscreen = workspaceMode === 'fullscreen';

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
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
      </div>

      <WorkspaceShell
        title="JSON Tree Viewer"
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

        {/* Side-by-side Equal-Height Editors/Panels Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          {/* Left: Raw JSON Input Editor (5 cols) */}
          <div className="lg:col-span-5 w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`viewer-input-${activeTabId}`}
              title={`JSON Source (${activeTab.title})`}
              value={activeTab.inputJson}
              onChange={(val) => {
                updateActiveTab({
                  inputJson: val,
                  undoInput: null,
                  isDirty: true,
                });
              }}
              placeholder="Paste JSON to explore..."
              error={error}
              errorLine={line}
              diagnostics={diagnostics}
              canSmartFix={Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')}
              onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
              heightClass="h-full"
            />
          </div>

          {/* Right: Interactive Tree View (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#121620] border border-[#1A202C] rounded-xl overflow-hidden shadow-xl h-full min-h-0">
            {/* Tree Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0B0D13]/70 border-b border-[#1A202C] shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                <span className="font-semibold text-xs text-white">Interactive Tree View</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search keys/values..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#121620] text-xs text-slate-200 pl-8 pr-3 py-1 rounded-lg border border-[#262D3D] focus:border-[#38BDF8] focus:outline-none w-40"
                  />
                </div>

                <button
                  onClick={() => setExpandAll(!expandAll)}
                  className="px-2.5 py-1 text-xs rounded bg-[#1A202C] text-slate-300 hover:text-white border border-[#262D3D] transition-colors"
                >
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>

            {/* Tree Container with internal scrolling */}
            <div className="p-4 flex-1 overflow-auto font-mono text-xs text-slate-300 min-h-0">
              {parsedData !== null && parsedData !== undefined ? (
                <TreeNode
                  name="root"
                  value={parsedData}
                  searchTerm={searchTerm}
                  expandAll={expandAll}
                  onShowToast={onShowToast}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                  <Sliders className="w-8 h-8 mb-2 stroke-[1.5] text-slate-600" />
                  <p className="text-sm">Provide valid JSON on the left to explore the tree hierarchy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </WorkspaceShell>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SeoContentSection content={SEO_DATA_BY_PATH['/json-viewer']} />
      </div>
    </div>
  );
};

interface TreeNodeProps {
  name: string;
  value: any;
  searchTerm: string;
  expandAll: boolean;
  depth?: number;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  name,
  value,
  searchTerm,
  expandAll,
  depth = 0,
  onShowToast,
}) => {
  const [isOpen, setIsOpen] = useState(expandAll);
  const [copied, setCopied] = useState(false);

  // Sync state if expandAll toggle changes
  React.useEffect(() => {
    setIsOpen(expandAll);
  }, [expandAll]);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
    setCopied(true);
    onShowToast(`Copied value for "${name}"`, 'success');
    setTimeout(() => setCopied(false), 1500);
  };

  const matchesSearch = (k: string, v: any): boolean => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (k.toLowerCase().includes(term)) return true;
    if (typeof v === 'string' && v.toLowerCase().includes(term)) return true;
    if (typeof v === 'number' && String(v).includes(term)) return true;
    if (typeof v === 'object' && v !== null) {
      return Object.entries(v).some(([childK, childV]) => matchesSearch(childK, childV));
    }
    return false;
  };

  if (searchTerm && !matchesSearch(name, value)) {
    return null;
  }

  const renderValueBadge = () => {
    if (value === null) return <span className="text-rose-400 font-semibold">null</span>;
    if (typeof value === 'boolean') {
      return (
        <span className="text-amber-400 font-semibold flex items-center gap-1">
          <ToggleLeft className="w-3 h-3" />
          {String(value)}
        </span>
      );
    }
    if (typeof value === 'number') {
      return (
        <span className="text-[#38BDF8] flex items-center gap-1">
          <Hash className="w-3 h-3 text-[#38BDF8]/60" />
          {value}
        </span>
      );
    }
    if (typeof value === 'string') {
      return (
        <span className="text-[#34D399] flex items-center gap-1">
          <Type className="w-3 h-3 text-[#34D399]/60" />
          &quot;{value}&quot;
        </span>
      );
    }
    return null;
  };

  return (
    <div className="select-text" style={{ paddingLeft: depth > 0 ? '1rem' : '0' }}>
      <div
        onClick={() => isObject && setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[#1A202C]/60 transition-colors ${
          isObject ? 'cursor-pointer' : ''
        }`}
      >
        {isObject ? (
          <span className="text-slate-500 hover:text-white">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        <span className="text-slate-400 font-semibold">{name}:</span>

        {isObject ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-mono flex items-center gap-1">
              {isArray ? <Brackets className="w-3 h-3" /> : <Folder className="w-3 h-3" />}
              {isArray ? `Array [${value.length}]` : `Object {${Object.keys(value).length}}`}
            </span>
          </div>
        ) : (
          renderValueBadge()
        )}

        <button
          onClick={handleCopyValue}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#262D3D] rounded text-slate-400 hover:text-white transition-opacity ml-auto"
          title="Copy node value"
        >
          {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {isObject && isOpen && (
        <div className="border-l border-[#262D3D] ml-2">
          {Object.entries(value).map(([childKey, childVal]) => (
            <TreeNode
              key={childKey}
              name={childKey}
              value={childVal}
              searchTerm={searchTerm}
              expandAll={expandAll}
              depth={depth + 1}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default JsonViewerPage;
