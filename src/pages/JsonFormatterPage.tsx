import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
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
  Sliders,
} from 'lucide-react';

export const JsonFormatterPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [indentation, setIndentation] = useState<number | 'tab'>(2);

  // Parse state & diagnostics
  const { parsed, isValid, error, line, column } = useMemo(() => {
    if (!inputJson.trim()) {
      return { parsed: null, isValid: null, error: null, line: null, column: null };
    }
    try {
      const p = JSON.parse(inputJson);
      return { parsed: p, isValid: true, error: null, line: null, column: null };
    } catch (err: any) {
      const msg = err?.message || 'Invalid JSON syntax';
      let errLine: number | null = null;
      let errCol: number | null = null;
      const match = msg.match(/line (\d+) column (\d+)/i) || msg.match(/position (\d+)/i);
      if (match) {
        if (match[2]) {
          errLine = parseInt(match[1], 10);
          errCol = parseInt(match[2], 10);
        } else if (match[1]) {
          const pos = parseInt(match[1], 10);
          const lines = inputJson.slice(0, pos).split('\n');
          errLine = lines.length;
          errCol = lines[lines.length - 1].length + 1;
        }
      }
      return { parsed: null, isValid: false, error: msg, line: errLine, column: errCol };
    }
  }, [inputJson]);

  // Format Action
  const handleFormat = () => {
    if (!isValid || parsed === null) {
      onShowToast('Cannot format invalid JSON. Please resolve syntax errors.', 'error');
      return;
    }
    const indent = indentation === 'tab' ? '\t' : indentation;
    const formatted = JSON.stringify(parsed, null, indent);
    setOutputJson(formatted);
    onShowToast(`Formatted JSON (${indentation === 'tab' ? 'Tabs' : `${indentation} spaces`})`, 'success');
  };

  // Minify Action
  const handleMinify = () => {
    if (!isValid || parsed === null) {
      onShowToast('Cannot minify invalid JSON', 'error');
      return;
    }
    const minified = JSON.stringify(parsed);
    setOutputJson(minified);
    onShowToast('Minified JSON to compact representation', 'success');
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
      onShowToast(error || 'Syntax error detected in JSON', 'error');
    }
  };

  // Clear Action
  const handleClear = () => {
    setInputJson('');
    setOutputJson('');
    onShowToast('Cleared editors', 'info');
  };

  // Reset to sample
  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    setInputJson(s);
    setOutputJson(s);
    onShowToast('Loaded sample dataset', 'info');
  };

  // Copy Output
  const handleCopyOutput = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    onShowToast('Copied formatted JSON to clipboard', 'success');
  };

  // Export / Download Output
  const handleExport = () => {
    if (!outputJson) return;
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported JSON file to downloads', 'success');
  };

  const inputSize = new Blob([inputJson]).size;
  const outputSize = new Blob([outputJson]).size;
  const inputLines = inputJson ? inputJson.split('\n').length : 0;
  const outputLines = outputJson ? outputJson.split('\n').length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Formatter' }]} />

      <ToolHeader
        title="JSON Formatter"
        description="Format, prettify, minify, and validate JSON payloads with configurable indentation."
        icon={Braces}
        badge="RFC 8259"
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

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#121620] border border-[#1A202C] mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Button */}
          <button
            onClick={handleFormat}
            disabled={!isValid}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isValid
                ? 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format</span>
          </button>

          {/* Minify Button */}
          <button
            onClick={handleMinify}
            disabled={!isValid}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isValid
                ? 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border-[#262D3D]'
                : 'bg-slate-900 text-slate-600 border-transparent cursor-not-allowed'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Validate</span>
          </button>

          {/* Indentation Selector */}
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-[#262D3D] text-xs text-slate-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Indent:</span>
            <select
              value={indentation}
              onChange={(e) => {
                const val = e.target.value;
                setIndentation(val === 'tab' ? 'tab' : parseInt(val, 10));
              }}
              className="bg-[#0B0D13] text-slate-200 border border-[#262D3D] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#38BDF8]"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>
        </div>

        {/* Export / Copy Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyOutput}
            disabled={!outputJson}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Output</span>
          </button>
          <button
            onClick={handleExport}
            disabled={!outputJson}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Banner if error exists */}
      {!isValid && error && (
        <div className="mb-4 p-3 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-xs flex items-start gap-2 text-[#F43F5E]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">JSON Syntax Error:</span> {error}
            {line && (
              <span className="ml-2 font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F43F5E]/20">
                Line {line}, Col {column}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Side-by-side Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Input Editor */}
        <div className="flex flex-col">
          <CodeEditor
            title="Input JSON"
            value={inputJson}
            onChange={(val) => {
              setInputJson(val);
              // live auto-update output if valid
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
          />
        </div>

        {/* Output Editor */}
        <div className="flex flex-col">
          <CodeEditor
            title="Formatted Output"
            value={outputJson}
            readOnly={false}
            onChange={setOutputJson}
            placeholder="Formatted output will appear here..."
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 px-4 py-2.5 rounded-lg bg-[#121620] border border-[#1A202C] flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            {isValid === true ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-[#34D399] font-medium">Valid JSON</span>
              </>
            ) : isValid === false ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span className="text-[#F43F5E] font-medium">Invalid JSON</span>
              </>
            ) : (
              <span>Empty Payload</span>
            )}
          </span>
          <span>•</span>
          <span>Input: {inputLines} lines ({inputSize} bytes)</span>
          <span>•</span>
          <span>Output: {outputLines} lines ({outputSize} bytes)</span>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          Format: {indentation === 'tab' ? 'Tab' : `${indentation}-space`} indent
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-formatter']} />
    </div>
  );
};
