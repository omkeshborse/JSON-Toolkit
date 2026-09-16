import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Trash2,
  Copy,
  Info,
  Layers,
  FileCode,
} from 'lucide-react';

const INVALID_SAMPLE = `{
  "title": "Invalid Sample Payload",
  "missingTrailingQuote: "Value without closing quote,
  "trailingComma": true,
}`;

export const JsonValidatorPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [jsonText, setJsonText] = useState<string>('');

  // Parse state & diagnostics
  const validationResult = useMemo(() => {
    const trimmed = jsonText.trim();
    if (!trimmed) {
      return { status: 'empty', error: null, line: null, column: null, stats: null };
    }

    try {
      const parsed = JSON.parse(trimmed);

      // Collect structural stats
      let nodeCount = 0;
      let maxDepth = 0;

      function traverse(val: any, depth = 1) {
        nodeCount++;
        if (depth > maxDepth) maxDepth = depth;
        if (val !== null && typeof val === 'object') {
          if (Array.isArray(val)) {
            val.forEach((item) => traverse(item, depth + 1));
          } else {
            Object.values(val).forEach((v) => traverse(v, depth + 1));
          }
        }
      }

      traverse(parsed, 1);

      return {
        status: 'valid',
        error: null,
        line: null,
        column: null,
        stats: {
          nodeCount,
          maxDepth,
          byteSize: new Blob([jsonText]).size,
          rootType: Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' ? 'Object' : typeof parsed,
        },
      };
    } catch (err: any) {
      const msg = err?.message || 'Invalid JSON syntax';
      let errLine: number | null = null;
      let errCol: number | null = null;

      // Extract line and column info from JS engine error
      const match = msg.match(/line (\d+) column (\d+)/i) || msg.match(/position (\d+)/i);
      if (match) {
        if (match[2]) {
          errLine = parseInt(match[1], 10);
          errCol = parseInt(match[2], 10);
        } else if (match[1]) {
          const pos = parseInt(match[1], 10);
          const lines = jsonText.slice(0, pos).split('\n');
          errLine = lines.length;
          errCol = lines[lines.length - 1].length + 1;
        }
      }

      return {
        status: 'invalid',
        error: msg,
        line: errLine,
        column: errCol,
        stats: null,
      };
    }
  }, [jsonText]);

  const handleValidate = () => {
    if (validationResult.status === 'valid') {
      onShowToast('Strict validation passed: Valid RFC 8259 JSON payload', 'success');
    } else if (validationResult.status === 'invalid') {
      onShowToast(validationResult.error || 'Syntax error found in JSON document', 'error');
    } else {
      onShowToast('Document is empty. Enter JSON to validate.', 'info');
    }
  };

  const handleLoadValidSample = () => {
    setJsonText(JSON.stringify(SAMPLE_DATASETS[0].data, null, 2));
    onShowToast('Loaded valid JSON sample', 'info');
  };

  const handleLoadInvalidSample = () => {
    setJsonText(INVALID_SAMPLE);
    onShowToast('Loaded invalid sample to test diagnostic reporting', 'info');
  };

  const handleClear = () => {
    setJsonText('');
    onShowToast('Cleared editor', 'info');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    onShowToast('Copied JSON to clipboard', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Validator' }]} />

      <ToolHeader
        title="JSON Validator"
        description="Verify JSON syntax strictly against RFC 8259 with exact line and column diagnostic locator."
        icon={CheckCircle2}
        badge="Syntax Engine"
        actions={
          <>
            <button
              onClick={handleLoadValidSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Valid Sample</span>
            </button>
            <button
              onClick={handleLoadInvalidSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-[#F43F5E] border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Invalid Sample</span>
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

      {/* Validation Result Banner */}
      <div className="mb-4">
        {validationResult.status === 'valid' && (
          <div className="p-4 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#34D399]/20 flex items-center justify-center text-[#34D399] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#34D399] flex items-center gap-2">
                  Valid JSON Syntax
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/20 text-[#34D399] font-normal">
                    RFC 8259 Compliant
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  The document contains valid grammar and can be parsed by any standard JSON parser.
                </p>
              </div>
            </div>

            {validationResult.stats && (
              <div className="flex items-center gap-4 text-xs font-mono text-slate-300 sm:border-l sm:border-[#34D399]/20 sm:pl-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Root Type</span>
                  <span className="font-semibold text-white">{validationResult.stats.rootType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Nodes</span>
                  <span className="font-semibold text-white">{validationResult.stats.nodeCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Max Depth</span>
                  <span className="font-semibold text-white">{validationResult.stats.maxDepth}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {validationResult.status === 'invalid' && (
          <div className="p-4 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-white">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F43F5E]/20 flex items-center justify-center text-[#F43F5E] shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F43F5E]">
                    Invalid JSON Syntax Detected
                  </h3>
                  {validationResult.line && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40 font-medium">
                      Line {validationResult.line}, Column {validationResult.column}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-mono mt-2 p-2.5 rounded bg-[#0B0D13]/80 border border-[#F43F5E]/20">
                  {validationResult.error}
                </p>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Common causes include trailing commas, unescaped quotes, or mismatched braces.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {validationResult.status === 'empty' && (
          <div className="p-4 rounded-xl bg-[#121620] border border-[#1A202C] flex items-center gap-3 text-slate-400">
            <Info className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="text-xs">
              <span className="text-white font-medium">Editor is empty.</span> Paste or type JSON code below, or load a sample to inspect syntax.
            </div>
          </div>
        )}
      </div>

      {/* Editor & Actions */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs text-slate-400 font-medium">JSON Source Editor</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidate}
              className="px-3 py-1 text-xs font-semibold rounded bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validate Now</span>
            </button>
            <button
              onClick={handleCopy}
              disabled={!jsonText}
              className="px-2.5 py-1 text-xs font-medium rounded bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[420px]">
          <CodeEditor
            title="Source Payload"
            value={jsonText}
            onChange={setJsonText}
            placeholder="Paste JSON document to validate..."
            error={validationResult.error}
          />
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-validator']} />
    </div>
  );
};
