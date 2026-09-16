import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
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
} from 'lucide-react';

export const JsonMinifierPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [inputJson, setInputJson] = useState<string>('');
  const [minifiedJson, setMinifiedJson] = useState<string>('');

  const { parsed, isValid, error } = useMemo(() => {
    if (!inputJson.trim()) {
      return { parsed: null, isValid: false, error: null };
    }
    try {
      const p = JSON.parse(inputJson);
      return { parsed: p, isValid: true, error: null };
    } catch (err: any) {
      return { parsed: null, isValid: false, error: err?.message || 'Invalid JSON syntax' };
    }
  }, [inputJson]);

  // Compression metrics
  const originalBytes = new Blob([inputJson]).size;
  const minifiedBytes = new Blob([minifiedJson]).size;
  const bytesSaved = Math.max(0, originalBytes - minifiedBytes);
  const percentSaved = originalBytes > 0 ? Math.round((bytesSaved / originalBytes) * 1000) / 10 : 0;
  const originalLines = inputJson ? inputJson.split('\n').length : 0;

  const handleMinify = () => {
    if (!isValid || parsed === null) {
      onShowToast('Cannot minify invalid JSON', 'error');
      return;
    }
    const result = JSON.stringify(parsed);
    setMinifiedJson(result);
    onShowToast(`Minified JSON — saved ${percentSaved}% (${bytesSaved} bytes)`, 'success');
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
    a.download = 'payload.min.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded payload.min.json', 'success');
  };

  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    setInputJson(s);
    setMinifiedJson(JSON.stringify(SAMPLE_DATASETS[0].data));
    onShowToast('Loaded sample dataset', 'info');
  };

  const handleClear = () => {
    setInputJson('');
    setMinifiedJson('');
    onShowToast('Cleared editors', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Minifier' }]} />

      <ToolHeader
        title="JSON Minifier"
        description="Strip whitespace, newlines, and indentations to compress JSON payloads for minimal network payload size."
        icon={Minimize2}
        badge="Compressor"
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

      {/* Compression Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3.5 rounded-lg bg-[#121620] border border-[#1A202C]">
          <span className="text-[11px] text-slate-400 block">Original Size</span>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            {originalBytes.toLocaleString()} <span className="text-xs text-slate-500 font-normal">B</span>
          </div>
          <span className="text-[10px] text-slate-500">{originalLines} lines</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#121620] border border-[#1A202C]">
          <span className="text-[11px] text-slate-400 block">Minified Size</span>
          <div className="text-lg font-bold text-[#34D399] font-mono mt-0.5">
            {minifiedBytes.toLocaleString()} <span className="text-xs text-slate-500 font-normal">B</span>
          </div>
          <span className="text-[10px] text-slate-500">1 line (single string)</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#121620] border border-[#1A202C]">
          <span className="text-[11px] text-slate-400 block">Space Reduced</span>
          <div className="text-lg font-bold text-[#38BDF8] font-mono mt-0.5">
            {percentSaved}%
          </div>
          <span className="text-[10px] text-slate-500">Saved {bytesSaved.toLocaleString()} bytes</span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#121620] border border-[#1A202C] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Action</span>
            <button
              onClick={handleMinify}
              disabled={!isValid}
              className={`mt-1 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isValid
                  ? 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Minify Now</span>
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={handleCopy}
              disabled={!minifiedJson}
              className="p-1.5 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 border border-[#262D3D] text-xs cursor-pointer disabled:opacity-50"
              title="Copy minified"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              disabled={!minifiedJson}
              className="p-1.5 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 border border-[#262D3D] text-xs cursor-pointer disabled:opacity-50"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col min-h-[440px]">
          <CodeEditor
            title="Source JSON"
            value={inputJson}
            onChange={(val) => {
              setInputJson(val);
              try {
                const p = JSON.parse(val);
                setMinifiedJson(JSON.stringify(p));
              } catch {
                // leave minified as is while editing
              }
            }}
            placeholder="Paste formatted JSON..."
            error={error}
          />
        </div>

        <div className="flex flex-col min-h-[440px]">
          <CodeEditor
            title="Minified Single-Line Result"
            value={minifiedJson}
            readOnly={false}
            onChange={setMinifiedJson}
            placeholder="Minified single-line JSON will appear here..."
          />
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-minifier']} />
    </div>
  );
};
