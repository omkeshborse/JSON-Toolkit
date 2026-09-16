import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { compareJson, DiffResult, DiffType } from '../utils/jsonDiff';
import {
  GitCompare,
  Plus,
  Minus,
  RotateCw,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRightLeft,
  Search,
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
  const [jsonA, setJsonA] = useState<string>('');
  const [jsonB, setJsonB] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'added' | 'removed' | 'changed'>('all');
  const [searchPath, setSearchPath] = useState('');

  // Parse state
  const stateA = useMemo(() => {
    if (!jsonA.trim()) return { data: null, isValid: false, error: null };
    try {
      return { data: JSON.parse(jsonA), isValid: true, error: null };
    } catch (err: any) {
      return { data: null, isValid: false, error: err?.message || 'Invalid JSON syntax in A' };
    }
  }, [jsonA]);

  const stateB = useMemo(() => {
    if (!jsonB.trim()) return { data: null, isValid: false, error: null };
    try {
      return { data: JSON.parse(jsonB), isValid: true, error: null };
    } catch (err: any) {
      return { data: null, isValid: false, error: err?.message || 'Invalid JSON syntax in B' };
    }
  }, [jsonB]);

  // Diff calculation
  const diffResult: DiffResult | null = useMemo(() => {
    if (!stateA.isValid || !stateB.isValid || stateA.data === null || stateB.data === null) {
      return null;
    }
    return compareJson(stateA.data, stateB.data);
  }, [stateA, stateB]);

  const handleSwap = () => {
    const temp = jsonA;
    setJsonA(jsonB);
    setJsonB(temp);
    onShowToast('Swapped JSON A and JSON B', 'info');
  };

  const handleResetSample = () => {
    setJsonA(SAMPLE_A);
    setJsonB(SAMPLE_B);
    onShowToast('Reset to sample comparison datasets', 'info');
  };

  const handleClear = () => {
    setJsonA('');
    setJsonB('');
    onShowToast('Cleared both editors', 'info');
  };

  // Filtered diff entries
  const filteredEntries = useMemo(() => {
    if (!diffResult) return [];
    return diffResult.entries.filter((entry) => {
      // Exclude pure identical entries from difference list unless needed
      if (entry.type === 'identical') return false;
      if (activeFilter !== 'all' && entry.type !== activeFilter) return false;
      if (searchPath && !entry.path.toLowerCase().includes(searchPath.toLowerCase())) return false;
      return true;
    });
  }, [diffResult, activeFilter, searchPath]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
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

      {/* Invalid warnings */}
      {(Boolean(stateA.error) || Boolean(stateB.error)) && (
        <div className="mb-4 p-3 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-xs text-[#F43F5E] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {stateA.error ? `JSON A: ${stateA.error}` : ''}
            {stateA.error && stateB.error ? ' | ' : ''}
            {stateB.error ? `JSON B: ${stateB.error}` : ''}
          </span>
        </div>
      )}

      {/* Editors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col min-h-[380px]">
          <CodeEditor
            title="Original JSON (A)"
            value={jsonA}
            onChange={setJsonA}
            placeholder="Paste original JSON..."
            error={stateA.error}
          />
        </div>

        <div className="flex flex-col min-h-[380px]">
          <CodeEditor
            title="Modified JSON (B)"
            value={jsonB}
            onChange={setJsonB}
            placeholder="Paste modified JSON..."
            error={stateB.error}
          />
        </div>
      </div>

      {/* Difference Detail Table / List */}
      <div className="bg-[#121620] border border-[#1A202C] rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0B0D13]/70 border-b border-[#1A202C]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-semibold text-white">Differences Inspector</span>
            <span className="text-[11px] text-slate-500">
              ({filteredEntries.length} items shown)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              placeholder="Search path..."
              className="bg-[#0B0D13] border border-[#262D3D] rounded-md pl-7 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#38BDF8] w-36 font-mono"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[#1A202C] font-mono text-xs">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-sans">
              {diffResult?.summary.isIdentical
                ? 'No differences between JSON A and JSON B.'
                : 'No differences matching current filter.'}
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isAdd = entry.type === 'added';
              const isRem = entry.type === 'removed';
              const isMod = entry.type === 'changed';

              return (
                <div
                  key={idx}
                  className="p-3 hover:bg-[#1A202C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isAdd
                          ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30'
                          : isRem
                          ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30'
                          : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30'
                      }`}
                    >
                      {entry.type}
                    </span>
                    <span className="text-white font-semibold">{entry.path}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] overflow-hidden">
                    {isRem && (
                      <span className="text-[#F43F5E] line-through truncate max-w-xs">
                        {JSON.stringify(entry.oldValue)}
                      </span>
                    )}

                    {isAdd && (
                      <span className="text-[#34D399] truncate max-w-xs">
                        {JSON.stringify(entry.newValue)}
                      </span>
                    )}

                    {isMod && (
                      <div className="flex items-center gap-2 truncate max-w-sm">
                        <span className="text-[#F43F5E] line-through truncate">
                          {JSON.stringify(entry.oldValue)}
                        </span>
                        <span className="text-slate-500">→</span>
                        <span className="text-[#34D399] truncate">
                          {JSON.stringify(entry.newValue)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-compare']} />
    </div>
  );
};
