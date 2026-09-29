import React, { useMemo, useEffect, useCallback } from 'react';
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
  Braces,
  CheckCircle2,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Minimize2,
  Sliders,
} from 'lucide-react';

export const JsonFormatterPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const {
    activeTab,
    activeTabId,
    updateActiveTab,
    workspaceMode,
  } = useWorkspace();

  // Unified validation for ACTIVE TAB via shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(activeTab.inputJson);
  }, [activeTab.inputJson]);

  const { isValid, data: parsed, error, line, diagnostics, candidate } = validation;

  // Real-time synchronization / Live JSON preview with Debounce
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
        const p = JSON.parse(activeTab.inputJson);
        const indent = activeTab.indentation === 'tab' ? '\t' : activeTab.indentation;
        const formatted = JSON.stringify(p, null, indent);
        if (formatted !== activeTab.outputJson) {
          updateActiveTab({ outputJson: formatted });
        }
      } catch {
        // Invalid input — keep last valid preview intact
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [activeTab.inputJson, activeTab.indentation, activeTabId, activeTab.outputJson, updateActiveTab]);

  // Manual Document Format Action
  const handleFormat = () => {
    if (!activeTab.inputJson.trim()) {
      onShowToast('Please provide JSON to format', 'info');
      return;
    }
    if (!isValid || parsed === null) {
      onShowToast('Cannot format invalid JSON. Use Smart Fix or Inspect Fixes to resolve syntax errors.', 'error');
      return;
    }
    try {
      const indent = activeTab.indentation === 'tab' ? '\t' : activeTab.indentation;
      const formatted = JsonEngine.format(activeTab.inputJson, { indent });
      updateActiveTab({ outputJson: formatted, isDirty: true });
      onShowToast(`Formatted JSON (${activeTab.indentation === 'tab' ? 'Tabs' : `${activeTab.indentation} spaces`})`, 'success');
    } catch {
      onShowToast('Cannot format invalid JSON', 'error');
    }
  };

  // Smart Fix Action triggered explicitly by user
  const handleApplySmartFix = (fixedText: string) => {
    const indent = activeTab.indentation === 'tab' ? '\t' : activeTab.indentation;
    let formattedOutput = fixedText;
    try {
      formattedOutput = JsonEngine.format(fixedText, { indent });
    } catch {
      // fallback
    }

    updateActiveTab({
      undoInput: activeTab.inputJson,
      inputJson: fixedText,
      outputJson: formattedOutput,
      isDirty: true,
    });

    onShowToast('Deterministic Smart Fix applied & formatted successfully!', 'success');
  };

  const handleUndoFix = () => {
    if (activeTab.undoInput !== null) {
      updateActiveTab({
        inputJson: activeTab.undoInput,
        undoInput: null,
        isDirty: true,
      });
      onShowToast('Reverted to original input', 'info');
    }
  };

  // Minify Action
  const handleMinify = () => {
    if (!isValid || parsed === null) {
      onShowToast('Cannot minify invalid JSON', 'error');
      return;
    }
    try {
      const minified = JsonEngine.minify(activeTab.inputJson);
      updateActiveTab({ outputJson: minified, isDirty: true });
      onShowToast('Minified JSON to compact representation', 'success');
    } catch {
      onShowToast('Cannot minify invalid JSON', 'error');
    }
  };

  // Validate Action
  const handleValidate = () => {
    if (!activeTab.inputJson.trim()) {
      onShowToast('Please enter or paste JSON to validate', 'info');
      return;
    }
    if (isValid) {
      onShowToast('Valid JSON syntax conforming to RFC 8259', 'success');
    } else {
      onShowToast(error || `${diagnostics.length} syntax error(s) detected`, 'error');
    }
  };

  // Clear Action
  const handleClear = () => {
    updateActiveTab({
      inputJson: '',
      outputJson: '',
      undoInput: null,
      isDirty: false,
    });
    onShowToast(`Cleared document "${activeTab.title}"`, 'info');
  };

  // Reset to sample dataset on active tab only
  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    updateActiveTab({
      inputJson: s,
      outputJson: s,
      undoInput: null,
      isDirty: false,
    });
    onShowToast(`Loaded sample dataset into "${activeTab.title}"`, 'info');
  };

  // Download Action for active tab
  const handleDownload = () => {
    const content = activeTab.outputJson || activeTab.inputJson;
    if (!content) {
      onShowToast('No JSON to download in this tab', 'error');
      return;
    }
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = activeTab.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${sanitizedTitle || 'document'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateActiveTab({ isDirty: false });
    onShowToast(`Downloaded ${a.download}`, 'success');
  };

  const canSmartFix = Boolean(candidate && candidate.isValid && candidate.confidence !== 'low');
  const isFullscreen = workspaceMode === 'fullscreen';

  // Custom output panel download button
  const outputDownloadAction = (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!activeTab.outputJson && !activeTab.inputJson}
      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D] text-xs transition-colors cursor-pointer disabled:opacity-50"
      title="Download active tab JSON file"
      aria-label="Download active tab JSON"
    >
      <Download className="w-3 h-3 text-[#34D399]" />
      <span className="hidden sm:inline">Download</span>
    </button>
  );

  const toolbarActions = (
    <>
      <button
        onClick={handleFormat}
        className="px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Format JSON</span>
      </button>

      <button
        onClick={handleMinify}
        className="px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
        <span>Minify</span>
      </button>

      <button
        onClick={handleValidate}
        className="px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
        <span>Validate</span>
      </button>
    </>
  );

  const toolbarRight = (
    <>
      <div className="flex items-center gap-1.5 text-slate-400">
        <Sliders className="w-3.5 h-3.5" />
        <span>Indentation:</span>
      </div>

      <div className="flex items-center gap-1 bg-[#0B0D13] p-0.5 rounded-lg border border-[#262D3D]">
        {([2, 4, 3, 'tab'] as const).map((indent) => (
          <button
            key={indent}
            onClick={() => {
              const formattedIndent = indent === 'tab' ? '\t' : indent;
              let newOutput = activeTab.outputJson;
              if (parsed !== null) {
                newOutput = JSON.stringify(parsed, null, formattedIndent);
              }
              updateActiveTab({ indentation: indent, outputJson: newOutput, isDirty: true });
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              activeTab.indentation === indent
                ? 'bg-[#121620] text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {indent === 'tab' ? 'Tabs' : `${indent}s`}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <Breadcrumb items={[{ label: 'JSON Formatter' }]} />

        <ToolHeader
          title="JSON Formatter & Beautifier"
          description="Clean, indent, and format multiple JSON documents simultaneously with real-time live preview and isolated tabs."
          icon={Braces}
          badge="Zero-Lag Parser"
          actions={
            <>
              <button
                onClick={handleResetSample}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sample</span>
              </button>
              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Tab</span>
              </button>
            </>
          }
        />
      </div>

      <WorkspaceShell
        title="JSON Formatter"
        actions={toolbarActions}
        controlsRight={toolbarRight}
        onShowToast={onShowToast}
      >
        {/* Smart Fix Banner when errors detected on ACTIVE TAB */}
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

        {/* Undo Banner if currently fixed on ACTIVE TAB */}
        {isValid && activeTab.undoInput !== null && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Deterministic Smart Fix applied to &quot;{activeTab.title}&quot;. Document is valid JSON.</span>
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

        {/* Side-by-side Equal-Height Editors Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          {/* Input Editor */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`input-${activeTabId}`}
              title={`Input JSON (${activeTab.title})`}
              value={activeTab.inputJson}
              onChange={(val) => {
                updateActiveTab({
                  inputJson: val,
                  undoInput: null,
                  isDirty: true,
                });
              }}
              placeholder="Paste raw unformatted or formatted JSON..."
              error={error}
              errorLine={line}
              diagnostics={diagnostics}
              canSmartFix={canSmartFix}
              onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
              heightClass="h-full"
            />
          </div>

          {/* Formatted Output Editor */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`output-${activeTabId}`}
              title={`Formatted Output (${activeTab.title})`}
              value={activeTab.outputJson}
              onChange={(val) => updateActiveTab({ outputJson: val, isDirty: true })}
              readOnly
              placeholder="Formatted JSON will appear here..."
              heightClass="h-full"
              extraActions={outputDownloadAction}
            />
          </div>
        </div>
      </WorkspaceShell>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SeoContentSection content={SEO_DATA_BY_PATH['/json-formatter']} />
      </div>
    </div>
  );
};
export default JsonFormatterPage;
