import React, { useState, useMemo, useRef } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor, CodeEditorHandle } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { ContextualDiagnosticPanel } from '../components/ContextualDiagnosticPanel';
import { FixInspectorModal } from '../components/FixInspectorModal';
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
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { analyzeJsonErrors } from '../utils/jsonEngine/errorAnalyzer';
import { evaluateAndRepair } from '../utils/jsonEngine/repairValidator';
import { buildProposedFixItems } from '../utils/jsonEngine/fixInspector';
import { buildContextualDiagnostic } from '../utils/jsonEngine/contextualDiagnostics';

const COMPLEX_INVALID_SAMPLE = `// Sample payload with common real-world JSON syntax errors
{
  name: '101 JSON Toolkit',
  version: 1.0,
  isActive: True,
  author: None,
  features: [
    'Syntax Error Detection',
    'Deterministic Smart Fix',
    'Schema Validation',
  ],
  /* Configuration options */
  settings: {
    theme: 'dark',
    autoFormat: False,
  },
}`;

export const JsonValidatorPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [undoText, setUndoText] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const editorRef = useRef<CodeEditorHandle>(null);

  // 1. Comprehensive multi-error diagnostics from engine
  const diagnostics = useMemo(() => {
    return analyzeJsonErrors(jsonText);
  }, [jsonText]);

  // 2. Deterministic smart fix candidate calculation
  const candidate = useMemo(() => {
    if (!jsonText.trim()) return null;
    return evaluateAndRepair(jsonText);
  }, [jsonText]);

  // 3. Proposed fix items for contextual actions
  const proposedFixes = useMemo(() => {
    if (!jsonText.trim() || !candidate?.isValid || candidate.confidence === 'low') {
      return [];
    }
    return buildProposedFixItems(jsonText);
  }, [jsonText, candidate]);

  // 4. Contextual diagnostic models with code snippets and explanations
  const contextualDiagnostics = useMemo(() => {
    return diagnostics.map((d) =>
      buildContextualDiagnostic(
        d,
        jsonText,
        candidate?.confidence || 'high',
        candidate?.confidenceScore || 0,
        Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')
      )
    );
  }, [diagnostics, jsonText, candidate]);

  // 5. Document statistics and native validation state
  const validationResult = useMemo(() => {
    const trimmed = jsonText.trim();
    if (!trimmed) {
      return { status: 'empty', error: null, line: null, column: null, stats: null };
    }

    try {
      const parsed = JSON.parse(trimmed);

      // Collect structural statistics
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
        status: 'valid' as const,
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
      const firstDiag = diagnostics[0];
      return {
        status: 'invalid' as const,
        error: err?.message || 'Invalid JSON syntax',
        line: firstDiag ? firstDiag.line : null,
        column: firstDiag ? firstDiag.column : null,
        stats: null,
      };
    }
  }, [jsonText, diagnostics]);

  const handleValidate = () => {
    if (validationResult.status === 'valid') {
      onShowToast('Strict validation passed: Valid RFC 8259 JSON payload', 'success');
    } else if (validationResult.status === 'invalid') {
      onShowToast(`${diagnostics.length} syntax error(s) detected. Check diagnostic report below.`, 'error');
    } else {
      onShowToast('Document is empty. Enter JSON to validate.', 'info');
    }
  };

  const handleApplySmartFix = (fixedText: string) => {
    setUndoText(jsonText);
    setJsonText(fixedText);
    onShowToast('Deterministic Smart Fix applied: Converted to valid RFC 8259 JSON', 'success');
  };

  const handleUndoFix = () => {
    if (undoText !== null) {
      setJsonText(undoText);
      setUndoText(null);
      onShowToast('Reverted to original JSON', 'info');
    }
  };

  const handleLoadValidSample = () => {
    setJsonText(JSON.stringify(SAMPLE_DATASETS[0].data, null, 2));
    setUndoText(null);
    onShowToast('Loaded valid JSON sample', 'info');
  };

  const handleLoadInvalidSample = () => {
    setJsonText(COMPLEX_INVALID_SAMPLE);
    setUndoText(null);
    onShowToast('Loaded sample with syntax errors', 'info');
  };

  const handleClear = () => {
    setJsonText('');
    setUndoText(null);
    onShowToast('Cleared editor content', 'info');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    onShowToast('Copied JSON to clipboard', 'success');
  };

  const handleJumpToLine = (line: number, column: number = 1) => {
    if (editorRef.current) {
      editorRef.current.scrollToLine(line, column);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Validator' }]} />

      <ToolHeader
        title="JSON Validator & Repair Engine"
        description="Analyze RFC 8259 compliance, inspect syntax errors with contextual diagnostics, and repair broken payloads with deterministic zero-hallucination rules."
        icon={CheckCircle2}
        badge="Syntax & Repair Engine"
        actions={
          <>
            {candidate && candidate.isValid && candidate.confidence !== 'low' && candidate.changes.length > 0 && (
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161C28] hover:bg-[#1E2638] text-[#38BDF8] border border-[#262D3D] flex items-center gap-1.5 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Inspect Fixes</span>
              </button>
            )}
            <button
              onClick={handleLoadValidSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Valid Sample</span>
            </button>
            <button
              onClick={handleLoadInvalidSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>Error Sample</span>
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
      {validationResult.status === 'invalid' && (
        <div className="mb-4">
          <SmartFixBanner
            diagnostics={diagnostics}
            candidate={candidate}
            rawInput={jsonText}
            onApplyFix={handleApplySmartFix}
            onUndoFix={handleUndoFix}
            canUndo={undoText !== null}
          />
        </div>
      )}

      {/* Undo Banner if currently fixed */}
      {validationResult.status === 'valid' && undoText !== null && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Smart Fix active. Your document is now 100% valid RFC 8259 JSON.</span>
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
                  The document conforms to standard grammar and can be parsed by any strict JSON parser.
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
          <div className="space-y-4">
            {/* Contextual Diagnostics Panel */}
            <ContextualDiagnosticPanel
              diagnostics={contextualDiagnostics}
              proposedFixes={proposedFixes}
              onSelectLine={handleJumpToLine}
              onOpenInspector={() => setIsInspectorOpen(true)}
              onApplyQuickFix={handleApplySmartFix}
              repairedText={candidate?.repaired}
            />
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
            ref={editorRef}
            title="Source Payload"
            value={jsonText}
            onChange={(val) => {
              setJsonText(val);
              if (undoText !== null) setUndoText(null);
            }}
            placeholder="Paste JSON document to validate..."
            error={validationResult.error}
            errorLine={validationResult.line}
            diagnostics={diagnostics}
            onGutterClick={handleJumpToLine}
            canSmartFix={Boolean(
              candidate &&
              candidate.isValid &&
              candidate.confidence !== 'low' &&
              candidate.changes.length > 0
            )}
            onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
          />
        </div>
      </div>

      {/* Inspector Modal */}
      {isInspectorOpen && (
        <FixInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          originalText={jsonText}
          onApplyFix={(fixed) => {
            handleApplySmartFix(fixed);
            setIsInspectorOpen(false);
          }}
        />
      )}

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-validator']} />
    </div>
  );
};
