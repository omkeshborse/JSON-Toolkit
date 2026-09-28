import React, { useRef, useMemo, useImperativeHandle, forwardRef, useEffect } from 'react';
import {
  Copy,
  Trash2,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Wand2,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
} from 'lucide-react';
import { JsonErrorDiagnostic } from '../utils/jsonEngine/types';

export interface CodeEditorHandle {
  scrollToLine: (line: number, column?: number) => void;
  focus: () => void;
}

export type EditorViewMode = 'normal' | 'expanded' | 'fullscreen';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  title?: string;
  readOnly?: boolean;
  error?: string | null;
  errorLine?: number | null;
  diagnostics?: JsonErrorDiagnostic[];
  onFormat?: () => void;
  onCopy?: () => void;
  onSmartFix?: () => void;
  canSmartFix?: boolean;
  heightClass?: string;
  placeholder?: string;
  onGutterClick?: (line: number) => void;
  // Panel-level Expand & Fullscreen controls (optional, only rendered if provided)
  viewMode?: EditorViewMode;
  onToggleExpand?: () => void;
  onToggleFullscreen?: () => void;
  extraActions?: React.ReactNode;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({
  value,
  onChange,
  title = 'JSON Document',
  readOnly = false,
  error = null,
  errorLine = null,
  diagnostics = [],
  onFormat,
  onCopy,
  onSmartFix,
  canSmartFix = false,
  heightClass = 'h-[calc(100vh-210px)] min-h-[450px]',
  placeholder = 'Paste or type JSON here...',
  onGutterClick,
  viewMode = 'normal',
  onToggleExpand,
  onToggleFullscreen,
  extraActions,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [activeLine, setActiveLine] = React.useState<number | null>(null);

  const lines = useMemo(() => {
    return value.split('\n');
  }, [value]);

  const errorLineSet = useMemo(() => {
    const set = new Set<number>();
    if (errorLine) set.add(errorLine);
    diagnostics.forEach((d) => {
      if (d.line) set.add(d.line);
    });
    return set;
  }, [errorLine, diagnostics]);

  // Expose scrollToLine and focus methods
  useImperativeHandle(ref, () => ({
    scrollToLine(line: number, column: number = 1) {
      if (!textareaRef.current) return;
      setActiveLine(line);

      const lineHeight = 20; // 20px leading-5
      const targetScroll = Math.max(0, (line - 1) * lineHeight - 60);
      textareaRef.current.scrollTop = targetScroll;
      if (gutterRef.current) {
        gutterRef.current.scrollTop = targetScroll;
      }

      const linesArray = value.split('\n');
      let offset = 0;
      for (let i = 0; i < Math.min(line - 1, linesArray.length); i++) {
        offset += linesArray[i].length + 1;
      }
      const charIndex = Math.min(value.length, offset + Math.max(0, column - 1));
      textareaRef.current.focus();
      try {
        textareaRef.current.setSelectionRange(charIndex, charIndex);
      } catch {
        // ignore
      }

      setTimeout(() => setActiveLine(null), 3000);
    },
    focus() {
      textareaRef.current?.focus();
    },
  }));

  // Synchronize gutter scrolling with textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const isFullscreen = viewMode === 'fullscreen';
  const isExpanded = viewMode === 'expanded';

  // Dynamic container styling based on viewMode
  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-[#0F1117] w-screen h-screen overflow-hidden shadow-2xl animate-in fade-in duration-150'
    : isExpanded
    ? 'flex flex-col bg-[#0F1117] border border-[#262D3D] rounded-xl overflow-hidden shadow-2xl transition-all duration-200 w-full'
    : 'flex flex-col bg-[#0F1117] border border-[#262D3D] rounded-xl overflow-hidden shadow-xl transition-all duration-200 w-full';

  // Dynamic body height
  const bodyHeightClass = isFullscreen
    ? 'flex-1 h-[calc(100vh-65px)] min-h-0'
    : isExpanded
    ? 'h-[75vh] min-h-[600px]'
    : heightClass;

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Editor Header */}
      <div className={`flex items-center justify-between px-4 ${isFullscreen ? 'py-3.5 bg-[#0B0D13]' : 'py-2.5 bg-[#121620]'} border-b border-[#1A202C] text-xs transition-colors`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            {isFullscreen && (
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse shrink-0" />
            )}
            <span className="font-semibold text-slate-200 font-sans tracking-wide truncate">
              {title}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono shrink-0">
            {lines.length.toLocaleString()} {lines.length === 1 ? 'line' : 'lines'}
          </span>

          {isFullscreen && (
            <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A202C] text-[#38BDF8] border border-[#262D3D]">
              Fullscreen Mode
            </span>
          )}

          {isExpanded && !isFullscreen && (
            <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A202C] text-amber-300 border border-[#262D3D]">
              Expanded View
            </span>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Custom extra actions (e.g. Download) */}
          {extraActions}

          {onSmartFix && canSmartFix && (
            <button
              type="button"
              onClick={onSmartFix}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Apply safe deterministic fix"
              aria-label="Apply Smart Fix"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Smart Fix</span>
            </button>
          )}

          {onFormat && (
            <button
              type="button"
              onClick={onFormat}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-[#38BDF8] border border-[#262D3D] hover:border-[#38BDF8]/50 transition-colors cursor-pointer"
              title="Beautify and format JSON"
              aria-label="Format JSON"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Format</span>
            </button>
          )}

          {!readOnly && (
            <label
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Upload JSON file"
              aria-label={`Upload JSON for ${title}`}
            >
              <Upload className="w-3 h-3" />
              <span className="hidden sm:inline">Upload</span>
              <input
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Choose file to upload"
              />
            </label>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Copy editor content"
            aria-label={`Copy ${title} content`}
          >
            {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Clear button (supported for both read-only output and editable input) */}
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 sm:px-2 sm:py-1 rounded hover:bg-[#F43F5E]/10 text-slate-400 hover:text-[#F43F5E] transition-colors cursor-pointer"
            title={`Clear ${title} text`}
            aria-label={`Clear ${title} text`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Optional panel-level view mode controls if provided */}
          {(onToggleExpand || onToggleFullscreen) && (
            <div className="h-4 w-px bg-[#262D3D] mx-0.5" />
          )}

          {onToggleExpand && !isFullscreen && (
            <button
              type="button"
              onClick={onToggleExpand}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                isExpanded
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D]'
              }`}
              title={isExpanded ? 'Restore normal layout' : 'Expand panel inside page'}
              aria-label={isExpanded ? `Restore ${title} layout` : `Expand ${title}`}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isExpanded ? 'Restore' : 'Expand'}</span>
            </button>
          )}

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                isFullscreen
                  ? 'bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90 font-semibold shadow-sm'
                  : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D]'
              }`}
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Open fullscreen (100% viewport)'}
              aria-label={isFullscreen ? `Exit fullscreen for ${title}` : `Open ${title} in fullscreen`}
            >
              {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body with line numbers */}
      <div className={`relative flex font-mono text-xs leading-relaxed ${bodyHeightClass} flex-1 overflow-hidden min-h-[380px]`}>
        {/* Line Numbers gutter */}
        <div
          ref={gutterRef}
          className="select-none py-3 px-1 text-right bg-[#0B0D13] border-r border-[#1A202C] text-slate-600 w-14 shrink-0 overflow-hidden"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const hasError = errorLineSet.has(lineNum);
            const isTarget = activeLine === lineNum;
            return (
              <div
                key={i}
                onClick={() => hasError && onGutterClick?.(lineNum)}
                className={`h-5 leading-5 text-[11px] flex items-center justify-between px-1 cursor-pointer transition ${
                  isTarget
                    ? 'text-amber-300 font-bold bg-amber-500/25 ring-1 ring-amber-400'
                    : hasError
                    ? 'text-rose-400 font-bold bg-rose-500/20 hover:bg-rose-500/30'
                    : 'hover:text-slate-400'
                }`}
                title={hasError ? `Error on line ${lineNum} - Click for details` : `Line ${lineNum}`}
              >
                <span>{hasError ? '⚠' : ''}</span>
                <span className="font-mono">{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 w-full p-3 bg-transparent text-slate-200 resize-none focus:outline-none focus:ring-0 overflow-auto whitespace-pre font-mono selection:bg-[#38BDF8]/30 leading-5 text-xs"
          aria-label={title}
        />
      </div>

      {/* Syntax error bar if invalid */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F43F5E]/10 border-t border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono shrink-0">
          <AlertCircle className="w-4 h-4 text-[#F43F5E] shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
