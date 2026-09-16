import React, { useRef, useMemo } from 'react';
import { Copy, Trash2, Upload, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  title?: string;
  readOnly?: boolean;
  error?: string | null;
  onFormat?: () => void;
  onCopy?: () => void;
  heightClass?: string;
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  title = 'JSON Document',
  readOnly = false,
  error = null,
  onFormat,
  onCopy,
  heightClass = 'h-[calc(100vh-210px)] min-h-[450px]',
  placeholder = 'Paste or type JSON here...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  const lines = useMemo(() => {
    return value.split('\n');
  }, [value]);

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
        const content = event.target?.result as string;
        if (content) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1A202C] bg-[#121620] overflow-hidden shadow-xl flex-1">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#1A202C] bg-[#0B0D13]/70 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
          <span className="font-medium text-slate-200">{title}</span>
          <span className="text-[11px] font-mono text-slate-500">
            {lines.length} lines · {value.length} chars
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onFormat && !readOnly && (
            <button
              onClick={onFormat}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Prettify formatting"
            >
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
              <span>Format</span>
            </button>
          )}

          {!readOnly && (
            <label className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white transition-colors cursor-pointer">
              <Upload className="w-3 h-3 text-[#34D399]" />
              <span>Upload</span>
              <input
                type="file"
                accept=".json,.txt,.csv,.xml,.yaml,.yml"
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
        <div className="select-none py-3 px-2 text-right bg-[#0B0D13] border-r border-[#1A202C] text-slate-600 w-12 shrink-0 overflow-hidden">
          {lines.map((_, i) => (
            <div key={i} className="h-5 leading-5 text-[11px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
};
