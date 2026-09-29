import React, { useMemo, useEffect } from 'react';
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
  Minimize2,
  Copy,
  Download,
  RotateCcw,
  Trash2,
  Zap,
  TrendingDown,
  FileCode,
  HardDrive,
  Sparkles,
} from 'lucide-react';

export const JsonMinifierPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const {
    activeTab,
    activeTabId,
    updateActiveTab,
    workspaceMode,
  } = useWorkspace();

  // Validate using shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(activeTab.inputJson);
  }, [activeTab.inputJson]);

  const { isValid, data: parsed, error, line, diagnostics, candidate } = validation;

  // Compression metrics
  const originalBytes = new Blob([activeTab.inputJson]).size;
  const minifiedBytes = new Blob([activeTab.outputJson]).size;
  const bytesSaved = Math.max(0, originalBytes - minifiedBytes);
  const percentSaved = originalBytes > 0 ? Math.round((bytesSaved / originalBytes) * 1000) / 10 : 0;
  const originalLines = activeTab.inputJson ? activeTab.inputJson.split('\n').length : 0;

  // Real-time synchronization / Live Minify with Debounce
  useEffect(() => {
    const trimmed = activeTab.inputJson.trim();
    if (!trimmed) {
      if (activeTab.outputJson) {
        updateActiveTab({ outputJson: '' });
      }
      return;
    }

    const debounceMs = activeTab.inputJson.length > 200_000 ? 550 : 350;

    const timer = setTimeout(() => {
      try {
        const minified = JsonEngine.minify(activeTab.inputJson);
        if (minified !== activeTab.outputJson) {
          updateActiveTab({ outputJson: minified });
        }
      } catch {
        // Invalid input: keep last valid output preview
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [activeTab.inputJson, activeTabId, activeTab.outputJson, updateActiveTab]);

  const handleMinify = () => {
    if (!activeTab.inputJson.trim()) {
      onShowToast('Please provide JSON to minify', 'info');
      return;
    }
    if (!isValid || parsed === null) {
      onShowToast('Cannot minify invalid JSON. Use Smart Fix to repair syntax.', 'error');
      return;
    }
    try {
      const result = JsonEngine.minify(activeTab.inputJson);
      updateActiveTab({ outputJson: result, isDirty: true });
      onShowToast(`Minified JSON — saved ${percentSaved}% (${bytesSaved} bytes)`, 'success');
    } catch {
      onShowToast('Failed to minify JSON', 'error');
    }
  };

  const handleApplySmartFix = (fixedText: string) => {
    let min = fixedText;
    try {
      min = JsonEngine.minify(fixedText);
    } catch {
      // fallback
    }
    updateActiveTab({
      undoInput: activeTab.inputJson,
      inputJson: fixedText,
      outputJson: min,
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

  const handleDownload = () => {
    if (!activeTab.outputJson && !activeTab.inputJson) return;
    const content = activeTab.outputJson || activeTab.inputJson;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = activeTab.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${sanitizedTitle || 'minified'}.min.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateActiveTab({ isDirty: false });
    onShowToast(`Downloaded ${a.download}`, 'success');
  };

  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    try {
      const min = JsonEngine.minify(s);
      updateActiveTab({ inputJson: s, outputJson: min, undoInput: null, isDirty: false });
    } catch {
      updateActiveTab({ inputJson: s, outputJson: '', undoInput: null, isDirty: false });
    }
    onShowToast('Loaded sample JSON', 'info');
  };

  const handleClear = () => {
    updateActiveTab({
      inputJson: '',
      outputJson: '',
      undoInput: null,
      isDirty: false,
    });
    onShowToast('Cleared input and output', 'info');
  };

  const isFullscreen = workspaceMode === 'fullscreen';

  const toolbarActions = (
    <button
      onClick={handleMinify}
      disabled={!isValid}
      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
        isValid
          ? 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sm'
          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
      }`}
    >
      <Minimize2 className="w-3.5 h-3.5" />
      <span>Minify Now</span>
    </button>
  );

  const outputDownloadAction = (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!activeTab.outputJson}
      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D] text-xs transition-colors cursor-pointer disabled:opacity-50"
      title="Download minified JSON"
    >
      <Download className="w-3 h-3 text-[#34D399]" />
      <span className="hidden sm:inline">Download</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <Breadcrumb items={[{ label: 'JSON Minifier' }]} />

        <ToolHeader
          title="JSON Minifier & Compressor"
          description="Remove unnecessary whitespace, newlines, and indentation from JSON documents to reduce payload size and optimize network transmission."
          icon={Minimize2}
          badge="Zero-Loss Compression"
          actions={
            <>
              <button
                onClick={handleResetSample}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sample</span>
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
        title="JSON Minifier"
        actions={toolbarActions}
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

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-[#0F1117] border border-[#262D3D] rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Original Size</div>
              <div className="text-sm font-semibold text-white">{originalBytes ? `${originalBytes.toLocaleString()} B` : '—'}</div>
            </div>
          </div>

          <div className="p-3 bg-[#0F1117] border border-[#262D3D] rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#34D399]/10 text-[#34D399] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Minified Size</div>
              <div className="text-sm font-semibold text-white">{minifiedBytes ? `${minifiedBytes.toLocaleString()} B` : '—'}</div>
            </div>
          </div>

          <div className="p-3 bg-[#0F1117] border border-[#262D3D] rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Savings</div>
              <div className="text-sm font-semibold text-white">{bytesSaved > 0 ? `${percentSaved}%` : '0%'}</div>
            </div>
          </div>

          <div className="p-3 bg-[#0F1117] border border-[#262D3D] rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Lines Collapsed</div>
              <div className="text-sm font-semibold text-white">{originalLines > 1 ? originalLines - 1 : 0}</div>
            </div>
          </div>
        </div>

        {/* Side-by-side Equal-Height Editors Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          {/* Input */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`input-${activeTabId}`}
              title={`Formatted Input (${activeTab.title})`}
              value={activeTab.inputJson}
              onChange={(val) => {
                updateActiveTab({
                  inputJson: val,
                  undoInput: null,
                  isDirty: true,
                });
              }}
              placeholder="Paste raw JSON here to minify..."
              error={error}
              errorLine={line}
              diagnostics={diagnostics}
              canSmartFix={Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')}
              onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
              heightClass="h-full"
            />
          </div>

          {/* Minified Output */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`output-${activeTabId}`}
              title={`Minified Result (${activeTab.title})`}
              value={activeTab.outputJson}
              onChange={(val) => updateActiveTab({ outputJson: val, isDirty: true })}
              readOnly
              placeholder="Minified JSON will appear here instantly..."
              heightClass="h-full"
              extraActions={outputDownloadAction}
            />
          </div>
        </div>
      </WorkspaceShell>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SeoContentSection content={SEO_DATA_BY_PATH['/json-minifier']} />
      </div>
    </div>
  );
};
export default JsonMinifierPage;
