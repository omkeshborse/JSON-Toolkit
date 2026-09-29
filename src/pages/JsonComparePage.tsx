import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { compareJson, DiffResult } from '../utils/jsonDiff';
import { JsonEngine } from '../utils/jsonEngine';
import {
  GitCompare,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft,
  Search,
  Minimize2,
  Maximize2,
  Expand,
  Shrink,
} from 'lucide-react';

const SAMPLE_A = `{
  "id": "item_101",
  "name": "Widget Alpha",
  "status": "active",
  "price": 29.99,
  "tags": ["hardware", "tools"],
  "specs": {
    "weight": 1.2,
    "color": "black",
    "warrantyMonths": 12
  }
}`;

const SAMPLE_B = `{
  "id": "item_101",
  "name": "Widget Alpha Pro",
  "status": "active",
  "price": 34.99,
  "tags": ["hardware", "tools", "featured"],
  "specs": {
    "weight": 1.15,
    "color": "matte black",
    "warrantyMonths": 24,
    "waterproof": true
  }
}`;

export const JsonComparePage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [jsonA, setJsonA] = useState<string>(SAMPLE_A);
  const [jsonB, setJsonB] = useState<string>(SAMPLE_B);
  const [undoA, setUndoA] = useState<string | null>(null);
  const [undoB, setUndoB] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'added' | 'removed' | 'changed'>('all');
  const [searchPath, setSearchPath] = useState('');

  // Expand & Fullscreen UI mode
  const [workspaceMode, setWorkspaceMode] = useState<'normal' | 'expanded' | 'fullscreen'>('normal');

  // Validate Side A and Side B independently using shared JsonEngine
  const validationA = useMemo(() => {
    return JsonEngine.validate(jsonA);
  }, [jsonA]);

  const validationB = useMemo(() => {
    return JsonEngine.validate(jsonB);
  }, [jsonB]);

  // Diff calculation
  const diffResult: DiffResult | null = useMemo(() => {
    if (!validationA.isValid || !validationB.isValid || validationA.data === null || validationB.data === null) {
      return null;
    }
    return compareJson(validationA.data, validationB.data);
  }, [validationA, validationB]);

  const handleSwap = () => {
    const temp = jsonA;
    setJsonA(jsonB);
    setJsonB(temp);
    setUndoA(null);
    setUndoB(null);
    onShowToast('Swapped JSON A and JSON B', 'info');
  };

  const handleResetSample = () => {
    setJsonA(SAMPLE_A);
    setJsonB(SAMPLE_B);
    setUndoA(null);
    setUndoB(null);
    onShowToast('Reset to sample comparison datasets', 'info');
  };

  const handleClear = () => {
    setJsonA('');
    setJsonB('');
    setUndoA(null);
    setUndoB(null);
    onShowToast('Cleared both editors', 'info');
  };

  const handleApplyFixA = (fixed: string) => {
    setUndoA(jsonA);
    setJsonA(fixed);
    onShowToast('Applied Smart Fix to JSON A', 'success');
  };

  const handleUndoFixA = () => {
    if (undoA !== null) {
      setJsonA(undoA);
      setUndoA(null);
      onShowToast('Reverted JSON A', 'info');
    }
  };

  const handleApplyFixB = (fixed: string) => {
    setUndoB(jsonB);
    setJsonB(fixed);
    onShowToast('Applied Smart Fix to JSON B', 'success');
  };

  const handleUndoFixB = () => {
    if (undoB !== null) {
      setJsonB(undoB);
      setUndoB(null);
      onShowToast('Reverted JSON B', 'info');
    }
  };

  const isFullscreen = workspaceMode === 'fullscreen';
  const isExpanded = workspaceMode === 'expanded';

  const toggleExpand = () => setWorkspaceMode((prev) => (prev === 'expanded' ? 'normal' : 'expanded'));
  const toggleFullscreen = () => setWorkspaceMode((prev) => (prev === 'fullscreen' ? 'normal' : 'fullscreen'));

  // Filtered diff entries
  const filteredEntries = useMemo(() => {
    if (!diffResult) return [];
    return diffResult.entries.filter((entry) => {
      if (entry.type === 'identical') return false;
      if (activeFilter !== 'all' && entry.type !== activeFilter) return false;
      if (searchPath && !entry.path.toLowerCase().includes(searchPath.toLowerCase())) return false;
      return true;
    });
  }, [diffResult, activeFilter, searchPath]);

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full transition-all duration-200 ${
        isExpanded ? 'max-w-[96vw]' : 'max-w-7xl'
      }`}
    >
      <Breadcrumb items={[{ label: 'JSON Compare' }]} />

      <ToolHeader
        title="JSON Compare & Diff"
        description="Deep structural comparison between two JSON documents to isolate additions, removals, and changes."
        icon={GitCompare}
        badge="Deep Diff"
        actions={
          <>
            <button
              onClick={handleSwap}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Swap JSON A and B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap A/B</span>
            </button>
            <button
              onClick={handleResetSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sample Diff</span>
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

      {/* Workspace Control Bar with Expand/Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121620] border border-[#1A202C] rounded-xl mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Comparison Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <button
              type="button"
              onClick={toggleExpand}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isExpanded
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border-[#262D3D]'
              }`}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'Restore' : 'Expand'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
              isFullscreen
                ? 'bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90'
                : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D]'
            }`}
          >
            {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Diff Summary Bar */}
      {diffResult && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#121620] border border-[#1A202C] mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {diffResult.summary.isIdentical ? (
              <div className="flex items-center gap-2 text-xs text-[#34D399] font-medium px-3 py-1 rounded-md bg-[#34D399]/10 border border-[#34D399]/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Documents are 100% Identical</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-white font-medium">
                <span className="font-semibold text-slate-300">Total Differences:</span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#1A202C] text-[#38BDF8] border border-[#262D3D]">
                  {diffResult.summary.totalDiffs}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                +{diffResult.summary.added} Added
              </span>
              <span className="px-2 py-0.5 rounded bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/20">
                -{diffResult.summary.removed} Removed
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20">
                ~{diffResult.summary.changed} Changed
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#0B0D13] p-1 rounded-lg border border-[#262D3D] text-xs">
            {(['all', 'added', 'removed', 'changed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#121620] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Fix Banners if either document is invalid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          {!validationA.isValid && jsonA.trim() && (
            <SmartFixBanner
              diagnostics={validationA.diagnostics}
              candidate={validationA.candidate}
              rawInput={jsonA}
              onApplyFix={handleApplyFixA}
              onUndoFix={handleUndoFixA}
              canUndo={undoA !== null}
            />
          )}
        </div>
        <div>
          {!validationB.isValid && jsonB.trim() && (
            <SmartFixBanner
              diagnostics={validationB.diagnostics}
              candidate={validationB.candidate}
              rawInput={jsonB}
              onApplyFix={handleApplyFixB}
              onUndoFix={handleUndoFixB}
              canUndo={undoB !== null}
            />
          )}
        </div>
      </div>

      {/* Editors Grid (Equal Height with internal scrolling) */}
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-[#0B0D13] w-screen h-screen overflow-hidden p-3 sm:p-4'
            : 'w-full mb-6'
        }
      >
        {isFullscreen && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#121620] border border-[#262D3D] rounded-xl text-xs mb-3 shrink-0">
            <span className="font-semibold text-white">JSON Compare Workspace (Side-by-Side View)</span>
            <button
              onClick={() => setWorkspaceMode('normal')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D] font-medium"
            >
              <Shrink className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Exit Fullscreen</span>
            </button>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              title="Original JSON (A)"
              value={jsonA}
              onChange={(val) => {
                setJsonA(val);
                if (undoA !== null) setUndoA(null);
              }}
              placeholder="Paste original JSON..."
              error={validationA.error}
              errorLine={validationA.line}
              diagnostics={validationA.diagnostics}
              canSmartFix={Boolean(validationA.candidate && validationA.candidate.isValid && validationA.candidate.confidence !== 'low')}
              onSmartFix={() => validationA.candidate && handleApplyFixA(validationA.candidate.repaired)}
              heightClass="h-full"
            />
          </div>

          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              title="Modified JSON (B)"
              value={jsonB}
              onChange={(val) => {
                setJsonB(val);
                if (undoB !== null) setUndoB(null);
              }}
              placeholder="Paste modified JSON..."
              error={validationB.error}
              errorLine={validationB.line}
              diagnostics={validationB.diagnostics}
              canSmartFix={Boolean(validationB.candidate && validationB.candidate.isValid && validationB.candidate.confidence !== 'low')}
              onSmartFix={() => validationB.candidate && handleApplyFixB(validationB.candidate.repaired)}
              heightClass="h-full"
            />
          </div>
        </div>
      </div>

      {/* Difference Results Table */}
      {diffResult && (
        <div className="bg-[#121620] border border-[#1A202C] rounded-xl overflow-hidden shadow-xl mb-4">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0B0D13]/70 border-b border-[#1A202C]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <span className="font-semibold text-xs text-white">Structural Diff Entries</span>
              <span className="text-[11px] font-mono text-slate-500">
                ({filteredEntries.length} displayed)
              </span>
            </div>

            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
                placeholder="Filter by path..."
                className="bg-[#0B0D13] border border-[#262D3D] rounded-md pl-7 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#38BDF8] w-48 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No differences found matching your current filter.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1A202C] bg-[#0F1117] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">JSON Path</th>
                    <th className="py-2.5 px-4 font-semibold">Side A (Original)</th>
                    <th className="py-2.5 px-4 font-semibold">Side B (Modified)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C] text-slate-300">
                  {filteredEntries.map((entry, index) => {
                    const isAdded = entry.type === 'added';
                    const isRemoved = entry.type === 'removed';
                    const isChanged = entry.type === 'changed';

                    return (
                      <tr
                        key={index}
                        className={`hover:bg-[#161B26] transition-colors ${
                          isAdded
                            ? 'bg-[#34D399]/5'
                            : isRemoved
                            ? 'bg-[#F43F5E]/5'
                            : isChanged
                            ? 'bg-[#FBBF24]/5'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-4 whitespace-nowrap">
                          {isAdded && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30">
                              + Added
                            </span>
                          )}
                          {isRemoved && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30">
                              - Removed
                            </span>
                          )}
                          {isChanged && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30">
                              ~ Changed
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-4 text-slate-300 font-semibold">{entry.path}</td>

                        <td className="py-2 px-4 text-slate-400 max-w-xs truncate">
                          {entry.oldValue !== undefined ? JSON.stringify(entry.oldValue) : <span className="text-slate-600">—</span>}
                        </td>

                        <td className="py-2 px-4 text-slate-200 max-w-xs truncate">
                          {entry.newValue !== undefined ? JSON.stringify(entry.newValue) : <span className="text-slate-600">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-compare']} />
    </div>
  );
};
export default JsonComparePage;
