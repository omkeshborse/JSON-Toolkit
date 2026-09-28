import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Copy, Trash2, Upload, Sparkles, Check, AlertCircle, Wand2, MapPin } from 'lucide-react';
import { JsonErrorDiagnostic } from '../utils/jsonEngine/types';

export interface CodeEditorHandle {
  scrollToLine: (line: number, column?: number) => void;
}

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
}, ref) => {
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

  // Expose scrollToLine method
  useImperativeHandle(ref, () => ({
    scrollToLine(line: number, column: number = 1) {
      if (!textareaRef.current) return;
      setActiveLine(line);

      // Calculate line height scroll position
      const lineHeight = 20; // 20px leading-5
      const targetScroll = Math.max(0, (line - 1) * lineHeight - 60);
      textareaRef.current.scrollTop = targetScroll;
      if (gutterRef.current) {
        gutterRef.current.scrollTop = targetScroll;
      }

      // Compute character offset to highlight selection
      const linesArray = value.split('\n');
      let offset = 0;
      for (let i = 0; i < Math.min(line - 1, linesArray.length); i++) {
        offset += linesArray[i].length + 1; // +1 for newline
      }
      const charIndex = Math.min(value.length, offset + Math.max(0, column - 1));
      textareaRef.current.focus();
      try {
        textareaRef.current.setSelectionRange(charIndex, charIndex);
      } catch {
        // ignore
      }

      // Clear active line after 3 seconds
      setTimeout(() => setActiveLine(null), 3000);
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

  return (
    <div className="flex flex-col bg-[#0F1117] border border-[#262D3D] rounded-xl overflow-hidden shadow-xl transition-all duration-200">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121620] border-b border-[#1A202C] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 font-sans tracking-wide">{title}</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSmartFix && canSmartFix && (
            <button
              onClick={onSmartFix}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Apply safe deterministic fix"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Smart Fix</span>
            </button>
          )}

          {onFormat && (
            <button
              onClick={onFormat}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-[#38BDF8] border border-[#262D3D] hover:border-[#38BDF8]/50 transition-colors cursor-pointer"
              title="Beautify and format JSON"
            >
              <Sparkles className="w-3 h-3" />
              <span>Format</span>
            </button>
          )}

          {!readOnly && (
            <label className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white transition-colors cursor-pointer">
              <Upload className="w-3 h-3" />
              <span>Upload</span>
              <input
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Copy editor content"
          >
            {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {!readOnly && (
            <button
              onClick={() => onChange('')}
              className="p-1 rounded hover:bg-[#F43F5E]/10 text-slate-400 hover:text-[#F43F5E] transition-colors cursor-pointer"
              title="Clear all text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body with line numbers */}
      <div className={`relative flex font-mono text-xs leading-relaxed ${heightClass} flex-1 overflow-hidden min-h-[380px]`}>
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
        />
      </div>

      {/* Syntax error bar if invalid */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F43F5E]/10 border-t border-[#F43F5E]/30 text-[#F43F5E] text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-[#F43F5E] shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
