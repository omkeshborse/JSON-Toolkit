import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { JsonEngine } from '../utils/jsonEngine';
import {
  Braces,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Minimize2,
  Maximize2,
  Sliders,
  Expand,
  Shrink,
  Wand2,
} from 'lucide-react';

export const JsonFormatterPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [indentation, setIndentation] = useState<number | 'tab'>(2);
  const [undoInput, setUndoInput] = useState<string | null>(null);

  // Common Workspace UI State: exactly ONE expand/fullscreen state for the entire workspace
  // 'normal' | 'expanded' | 'fullscreen'
  const [workspaceMode, setWorkspaceMode] = useState<'normal' | 'expanded' | 'fullscreen'>('normal');

  const workspaceContainerRef = useRef<HTMLDivElement>(null);

  // Unified validation via shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(inputJson);
  }, [inputJson]);

  const { isValid, data: parsed, error, line, column, diagnostics, candidate } = validation;

  // Format Action — strictly requires valid JSON, does not auto-mutate invalid input
  const handleFormat = () => {
    if (!inputJson.trim()) {
      onShowToast('Please provide JSON to format', 'info');
      return;
    }
    if (!isValid || parsed === null) {
      onShowToast('Cannot format invalid JSON. Use Quick Fix or Inspect Fixes to resolve syntax errors.', 'error');
      return;
    }
    try {
      const indent = indentation === 'tab' ? '\t' : indentation;
      const formatted = JsonEngine.format(inputJson, { indent });
      setOutputJson(formatted);
      onShowToast(`Formatted JSON (${indentation === 'tab' ? 'Tabs' : `${indentation} spaces`})`, 'success');
    } catch {
      onShowToast('Cannot format invalid JSON', 'error');
    }
  };

  // Smart Fix Action triggered explicitly by user
  const handleApplySmartFix = (fixedText: string) => {
    setUndoInput(inputJson);
    setInputJson(fixedText);

    const indent = indentation === 'tab' ? '\t' : indentation;
    try {
      const formatted = JsonEngine.format(fixedText, { indent });
      setOutputJson(formatted);
    } catch {
      setOutputJson(fixedText);
    }
    onShowToast('Deterministic Smart Fix applied & formatted successfully!', 'success');
  };

  const handleUndoFix = () => {
    if (undoInput !== null) {
      setInputJson(undoInput);
      setUndoInput(null);
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
      const minified = JsonEngine.minify(inputJson);
      setOutputJson(minified);
      onShowToast('Minified JSON to compact representation', 'success');
    } catch {
      onShowToast('Cannot minify invalid JSON', 'error');
    }
  };

  // Validate Action
  const handleValidate = () => {
    if (!inputJson.trim()) {
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
    setInputJson('');
    setOutputJson('');
    setUndoInput(null);
    onShowToast('Cleared both input and output', 'info');
  };

  // Reset to sample
  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    setInputJson(s);
    setOutputJson(s);
    setUndoInput(null);
    onShowToast('Loaded sample dataset', 'info');
  };

  // Output Download Action
  const handleDownload = () => {
    if (!outputJson) {
      onShowToast('No formatted JSON to download', 'error');
      return;
    }
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded formatted.json', 'success');
  };

  // Common Workspace Expand/Fullscreen Toggle
  const handleToggleWorkspaceFullscreen = () => {
    setWorkspaceMode((prev) => {
      const next = prev === 'fullscreen' ? 'normal' : 'fullscreen';
      if (next === 'fullscreen') {
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  // Optional in-page expand toggle if user wants expanded without fullscreen
  const handleToggleWorkspaceExpand = () => {
    setWorkspaceMode((prev) => (prev === 'expanded' ? 'normal' : 'expanded'));
  };

  // Exit fullscreen callback
  const exitWorkspaceFullscreen = useCallback(() => {
    setWorkspaceMode('normal');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle Escape key & fullscreenchange event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (workspaceMode === 'fullscreen') {
          exitWorkspaceFullscreen();
        } else if (workspaceMode === 'expanded') {
          setWorkspaceMode('normal');
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && workspaceMode === 'fullscreen') {
        setWorkspaceMode('normal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [workspaceMode, exitWorkspaceFullscreen]);

  // Lock background scroll when workspace is in fullscreen mode
  useEffect(() => {
    if (workspaceMode === 'fullscreen') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [workspaceMode]);

  const canSmartFix = Boolean(candidate && candidate.isValid && candidate.confidence !== 'low');

  const isFullscreen = workspaceMode === 'fullscreen';
  const isExpanded = workspaceMode === 'expanded';

  // Custom output panel download button to place on Output header
  const outputDownloadAction = (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!outputJson}
      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D] text-xs transition-colors cursor-pointer disabled:opacity-50"
      title="Download formatted JSON file"
      aria-label="Download formatted JSON"
    >
      <Download className="w-3 h-3 text-[#34D399]" />
      <span className="hidden sm:inline">Download</span>
    </button>
  );

  // Dynamic editor height classes based on workspaceMode
  const editorHeightClass = isFullscreen
    ? 'h-[calc(100vh-140px)] min-h-[400px]'
    : isExpanded
    ? 'h-[75vh] min-h-[620px]'
    : 'h-[calc(100vh-250px)] min-h-[460px]';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Formatter' }]} />

      <ToolHeader
        title="JSON Formatter & Beautifier"
        description="Clean, indent, and format JSON code to improve readability and maintain compliance with RFC 8259 standards."
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
              <span>Clear</span>
            </button>
          </>
        }
      />

      {/* Control bar with ONE COMMON Expand / Fullscreen control */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121620] border border-[#1A202C] rounded-xl mb-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Format */}
          <button
            onClick={handleFormat}
            className="px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format JSON</span>
          </button>

          {/* Minify Action */}
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Minify</span>
          </button>

          {/* Validate Action */}
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Validate</span>
          </button>
        </div>

        {/* Right side settings: Indentation selector + ONE COMMON Expand/Fullscreen Workspace Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Indentation:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0D13] p-0.5 rounded-lg border border-[#262D3D]">
            {([2, 4, 3, 'tab'] as const).map((indent) => (
              <button
                key={indent}
                onClick={() => {
                  setIndentation(indent);
                  if (parsed !== null) {
                    const formattedIndent = indent === 'tab' ? '\t' : indent;
                    setOutputJson(JSON.stringify(parsed, null, formattedIndent));
                  }
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  indentation === indent
                    ? 'bg-[#121620] text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {indent === 'tab' ? 'Tabs' : `${indent}s`}
              </button>
            ))}
          </div>

          {/* Separator before Workspace Expand/Fullscreen */}
          <div className="h-4 w-px bg-[#262D3D] hidden sm:block" />

          {/* In-page expand toggle */}
          {!isFullscreen && (
            <button
              type="button"
              onClick={handleToggleWorkspaceExpand}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isExpanded
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border-[#262D3D]'
              }`}
              title={isExpanded ? 'Restore normal workspace layout' : 'Expand workspace inside page'}
              aria-label={isExpanded ? 'Restore JSON workspace' : 'Expand JSON workspace'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'Restore' : 'Expand'}</span>
            </button>
          )}

          {/* ONE COMMON Fullscreen Workspace Toggle Button */}
          <button
            type="button"
            onClick={handleToggleWorkspaceFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
              isFullscreen
                ? 'bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90'
                : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D]'
            }`}
            title={isFullscreen ? 'Exit fullscreen workspace (Esc)' : 'Expand JSON workspace to fullscreen'}
            aria-label={isFullscreen ? 'Exit JSON workspace fullscreen' : 'Expand JSON workspace'}
          >
            {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Smart Fix Banner when errors detected */}
      {!isValid && inputJson.trim() && (
        <div className="mb-4">
          <SmartFixBanner
            diagnostics={diagnostics}
            candidate={candidate}
            rawInput={inputJson}
            onApplyFix={handleApplySmartFix}
            onUndoFix={handleUndoFix}
            canUndo={undoInput !== null}
          />
        </div>
      )}

      {/* Undo Banner if currently fixed */}
      {isValid && undoInput !== null && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Smart Fix applied. Document is valid JSON.</span>
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

      {/* COMMON WORKSPACE (Input JSON 50% | Formatted Output 50%) */}
      {/* When isFullscreen is active, this entire workspace container takes 100% viewport */}
      <div
        ref={workspaceContainerRef}
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-[#0B0D13] w-screen h-screen overflow-hidden p-3 sm:p-4 shadow-2xl animate-in fade-in duration-150'
            : 'w-full flex-1 flex flex-col'
        }
      >
        {/* Fullscreen Workspace Header Bar */}
        {isFullscreen && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#121620] border border-[#262D3D] rounded-xl mb-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-wide">
                  JSON Workspace
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A202C] text-[#38BDF8] border border-[#262D3D]">
                  Side-by-Side View
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFormat}
                className="px-2.5 py-1 rounded bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Format JSON</span>
              </button>

              <button
                type="button"
                onClick={exitWorkspaceFullscreen}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D] font-medium transition cursor-pointer text-xs"
                title="Exit fullscreen (Esc)"
                aria-label="Exit JSON workspace fullscreen"
              >
                <Shrink className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>
        )}

        {/* Side-by-side Editors Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Input Editor (50% on desktop) */}
          <div className="flex flex-col w-full h-full min-h-0">
            <CodeEditor
              title="Input JSON"
              value={inputJson}
              onChange={(val) => {
                setInputJson(val);
                if (undoInput !== null) setUndoInput(null);
                try {
                  const p = JSON.parse(val);
                  const indent = indentation === 'tab' ? '\t' : indentation;
                  setOutputJson(JSON.stringify(p, null, indent));
                } catch {
                  // leave output as is during syntax transition
                }
              }}
              placeholder="Paste raw unformatted or formatted JSON..."
              error={error}
              errorLine={line}
              diagnostics={diagnostics}
              canSmartFix={canSmartFix}
              onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
              heightClass={editorHeightClass}
            />
          </div>

          {/* Formatted Output Editor (50% on desktop) */}
          <div className="flex flex-col w-full h-full min-h-0">
            <CodeEditor
              title="Formatted Output"
              value={outputJson}
              onChange={setOutputJson}
              readOnly
              placeholder="Formatted JSON will appear here..."
              heightClass={editorHeightClass}
              extraActions={outputDownloadAction}
            />
          </div>
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-formatter']} />
    </div>
  );
};
export default JsonFormatterPage;
