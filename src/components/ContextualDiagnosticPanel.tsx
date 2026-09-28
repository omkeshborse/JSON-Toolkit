import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { ContextualDiagnosticInfo } from '../utils/jsonEngine/contextualDiagnostics';
import { QuickFixPreviewModal } from './QuickFixPreviewModal';
import { ProposedFixItem } from '../utils/jsonEngine/fixInspector';

interface ContextualDiagnosticPanelProps {
  diagnostics: ContextualDiagnosticInfo[];
  proposedFixes: ProposedFixItem[];
  onSelectLine?: (line: number, column?: number) => void;
  onOpenInspector?: () => void;
  onApplyQuickFix?: (repairedText: string) => void;
  repairedText?: string;
}

export const ContextualDiagnosticPanel: React.FC<ContextualDiagnosticPanelProps> = ({
  diagnostics,
  proposedFixes,
  onSelectLine,
  onOpenInspector,
  onApplyQuickFix,
  repairedText = '',
}) => {
  const [selectedQuickFix, setSelectedQuickFix] = useState<ProposedFixItem | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({ 0: true });

  if (diagnostics.length === 0) return null;

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isSingleFix = proposedFixes.length === 1;

  return (
    <div className="rounded-xl border border-[#262D3D] bg-[#0E131F] overflow-hidden text-xs">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#121620] border-b border-[#1A202C] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-slate-200">
            {diagnostics.length} Contextual Diagnostic{diagnostics.length !== 1 ? 's' : ''}
          </span>
        </div>

        {proposedFixes.length > 0 && onOpenInspector && (
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161C28] hover:bg-[#1E2638] text-[#38BDF8] border border-[#262D3D] transition cursor-pointer text-[11px] font-medium"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>
              {proposedFixes.length > 1
                ? `Inspect ${proposedFixes.length} Fixes`
                : 'Inspect Fix'}
            </span>
          </button>
        )}
      </div>

      {/* Diagnostics List */}
      <div className="divide-y divide-[#1A202C] max-h-96 overflow-y-auto">
        {diagnostics.map((item, idx) => {
          const isExpanded = expandedIndices[idx] ?? false;
          // Match matching proposed fix item if any
          const matchingFix = proposedFixes.find(
            (f) => f.category === item.category
          );

          return (
            <div key={item.diagnostic.id || idx} className="p-3">
              {/* Summary line */}
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => toggleExpand(idx)}
                  className="flex items-start gap-2 text-left flex-1 cursor-pointer focus:outline-none"
                >
                  <div className="mt-0.5 text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {item.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLine?.(item.diagnostic.line, item.diagnostic.column);
                        }}
                        className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-400 transition"
                        title="Jump to line in editor"
                      >
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>Line {item.diagnostic.line}, Col {item.diagnostic.column}</span>
                      </button>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {item.what}
                    </p>
                  </div>
                </button>

                {/* Quick Fix Button (only when 1 high confidence fix or specific item) */}
                {item.canQuickFix && matchingFix && onApplyQuickFix && (
                  <button
                    onClick={() => {
                      if (isSingleFix) {
                        setSelectedQuickFix(matchingFix);
                      } else if (onOpenInspector) {
                        onOpenInspector();
                      }
                    }}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isSingleFix ? 'Quick Fix' : 'Inspect Fixes'}</span>
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 pl-6 space-y-2.5">
                  {/* Explanation (Why) */}
                  <div className="flex items-start gap-1.5 text-slate-400 text-[11px] leading-relaxed">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{item.why}</span>
                  </div>

                  {/* Context Window (Nearby Lines) */}
                  {item.contextSnippet && item.contextSnippet.lines.length > 0 && (
                    <div className="rounded-lg bg-[#07090E] border border-[#1A202C] overflow-hidden font-mono text-[11px]">
                      <div className="px-2.5 py-1 bg-[#0E131F] border-b border-[#1A202C] text-[10px] text-slate-500 uppercase tracking-wider font-sans">
                        Context Snippet
                      </div>
                      <div className="py-1">
                        {item.contextSnippet.lines.map((l) => (
                          <div
                            key={l.lineNum}
                            className={`flex items-start px-2 py-0.5 ${
                              l.isErrorLine
                                ? 'bg-rose-950/30 text-rose-200 border-l-2 border-rose-500 font-semibold'
                                : 'text-slate-400'
                            }`}
                          >
                            <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-2 text-[10px]">
                              {l.lineNum}
                            </span>
                            <span className="whitespace-pre flex-1 break-all">
                              {l.text || ' '}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested fix description */}
                  {item.suggestedFixDesc && (
                    <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                      <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        <strong className="text-slate-200">Suggested action:</strong>{' '}
                        {item.suggestedFixDesc}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Fix Preview Confirmation Modal */}
      {selectedQuickFix && (
        <QuickFixPreviewModal
          isOpen={Boolean(selectedQuickFix)}
          onClose={() => setSelectedQuickFix(null)}
          fix={selectedQuickFix}
          onConfirmApply={() => {
            if (repairedText && onApplyQuickFix) {
              onApplyQuickFix(repairedText);
            }
          }}
        />
      )}
    </div>
  );
};
