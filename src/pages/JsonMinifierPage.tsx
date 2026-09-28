import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { JsonEngine } from '../utils/jsonEngine';
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
  const [inputJson, setInputJson] = useState<string>('');
  const [minifiedJson, setMinifiedJson] = useState<string>('');
  const [undoInput, setUndoInput] = useState<string | null>(null);

  // Validate using shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(inputJson);
  }, [inputJson]);

  const { isValid, data: parsed, error, line, diagnostics, candidate } = validation;

  // Compression metrics
  const originalBytes = new Blob([inputJson]).size;
  const minifiedBytes = new Blob([minifiedJson]).size;
  const bytesSaved = Math.max(0, originalBytes - minifiedBytes);
  const percentSaved = originalBytes > 0 ? Math.round((bytesSaved / originalBytes) * 1000) / 10 : 0;
  const originalLines = inputJson ? inputJson.split('\n').length : 0;

  const handleMinify = () => {
    if (!inputJson.trim()) {
      onShowToast('Please provide JSON to minify', 'info');
      return;
    }
    if (!isValid || parsed === null) {
      onShowToast('Cannot minify invalid JSON. Use Smart Fix to repair syntax.', 'error');
      return;
    }
    try {
      const result = JsonEngine.minify(inputJson);
      setMinifiedJson(result);
      onShowToast(`Minified JSON — saved ${percentSaved}% (${bytesSaved} bytes)`, 'success');
    } catch {
      onShowToast('Failed to minify JSON', 'error');
    }
  };

  const handleApplySmartFix = (fixedText: string) => {
    setUndoInput(inputJson);
    setInputJson(fixedText);
    try {
      const min = JsonEngine.minify(fixedText);
      setMinifiedJson(min);
    } catch {
      // leave minified as is
    }
    onShowToast('Deterministic Smart Fix applied: Converted to valid RFC 8259 JSON', 'success');
  };

  const handleUndoFix = () => {
    if (undoInput !== null) {
      setInputJson(undoInput);
      setUndoInput(null);
      setMinifiedJson('');
      onShowToast('Reverted to original JSON', 'info');
    }
  };

  const handleCopy = () => {
    if (!minifiedJson) return;
    navigator.clipboard.writeText(minifiedJson);
    onShowToast('Copied minified JSON to clipboard', 'success');
  };

  const handleDownload = () => {
    if (!minifiedJson) return;
    const blob = new Blob([minifiedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minified.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded minified.json', 'success');
  };

  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    setInputJson(s);
    setMinifiedJson('');
    setUndoInput(null);
    onShowToast('Loaded sample JSON', 'info');
  };

  const handleClear = () => {
    setInputJson('');
    setMinifiedJson('');
    setUndoInput(null);
    onShowToast('Cleared input and output', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Minifier' }]} />

      <ToolHeader
        title="JSON Minifier & Compressor"
        description="Remove unnecessary whitespace, newlines, and indentation from JSON documents to reduce payload size and optimize network transmission."
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
            <span>Deterministic Smart Fix active. Document is valid RFC 8259 JSON.</span>
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

      {/* Editor & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Input */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-slate-400 font-medium">Input JSON</span>
            <button
              onClick={handleMinify}
              disabled={!isValid}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                isValid
                  ? 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minify Now</span>
            </button>
          </div>
          <CodeEditor
            title="Formatted Input"
            value={inputJson}
            onChange={(val) => {
              setInputJson(val);
              if (undoInput !== null) setUndoInput(null);
            }}
            placeholder="Paste raw JSON here to minify..."
            error={error}
            errorLine={line}
            diagnostics={diagnostics}
            canSmartFix={Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')}
            onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-slate-400 font-medium">Minified JSON Output</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!minifiedJson}
                className="px-2.5 py-1 text-xs font-medium rounded bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!minifiedJson}
                className="px-2.5 py-1 text-xs font-medium rounded bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <CodeEditor
            title="Compact Representation"
            value={minifiedJson}
            onChange={setMinifiedJson}
            readOnly
            placeholder="Minified single-line JSON will appear here..."
          />
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-minifier']} />
    </div>
  );
};
