import React, { useState, useMemo } from 'react';
import {
  ProposedFixItem,
  buildProposedFixItems,
  evaluateSelectiveFixes,
} from '../utils/jsonEngine/fixInspector';
import { ERROR_CATEGORIES } from '../utils/jsonEngine/errorCategories';
import { SideBySideDiff } from './SideBySideDiff';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  CheckSquare,
  Square,
  Wand2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface FixInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApplyFix: (repairedText: string) => void;
}

export const FixInspectorModal: React.FC<FixInspectorModalProps> = ({
  isOpen,
  onClose,
  originalText,
  onApplyFix,
}) => {
  // Initialize discrete fix items from raw original text
  const initialFixes = useMemo(() => {
    return buildProposedFixItems(originalText);
  }, [originalText]);

  const [fixes, setFixes] = useState<ProposedFixItem[]>(initialFixes);

  // Sync state if initialFixes changes when opening
  React.useEffect(() => {
    setFixes(initialFixes);
  }, [initialFixes]);

  // Evaluate selective fixes based on current toggle states
  const evaluation = useMemo(() => {
    return evaluateSelectiveFixes(originalText, fixes);
  }, [originalText, fixes]);

  if (!isOpen) return null;

  // Toggle individual fix
  const handleToggleFix = (id: string) => {
    setFixes((prev) =>
      prev.map((f) => (f.id === id ? { ...f, accepted: !f.accepted } : f))
    );
  };

  // Accept all
  const handleAcceptAll = () => {
    setFixes((prev) => prev.map((f) => ({ ...f, accepted: true })));
  };

  // Reject all
  const handleRejectAll = () => {
    setFixes((prev) => prev.map((f) => ({ ...f, accepted: false })));
  };

  // Reset to original proposed selection
  const handleReset = () => {
    setFixes(initialFixes);
  };

  // Apply selected fix
  const handleApply = () => {
    if (!evaluation.isValid) return;
    onApplyFix(evaluation.repairedText);
    onClose();
  };

  const acceptedCount = fixes.filter((f) => f.accepted).length;
  const totalCount = fixes.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-modal-title"
    >
      <div className="flex flex-col w-full max-w-6xl h-[90vh] bg-[#0E131F] border border-[#262D3D] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A202C] bg-[#121620]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="inspector-modal-title" className="text-base font-semibold text-white flex items-center gap-2">
                Deterministic Smart Fix Inspector
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {acceptedCount} of {totalCount} fixes active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect changes side-by-side, toggle individual repairs, and ensure data preservation before applying.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A202C] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Change List (Left/Top) + Diff (Right/Bottom) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar: Fix List & Selectors */}
          <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-[#1A202C] bg-[#10141D] flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Proposed Fixes ({totalCount})
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={handleAcceptAll}
                  className="text-[#38BDF8] hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={handleRejectAll}
                  className="text-slate-400 hover:underline cursor-pointer"
                >
                  None
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* List of selectable fixes */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {fixes.map((fix) => {
                const meta = ERROR_CATEGORIES[fix.category];
                return (
                  <div
                    key={fix.id}
                    onClick={() => handleToggleFix(fix.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition select-none ${
                      fix.accepted
                        ? 'bg-[#161C28] border-[#38BDF8]/40 shadow-sm'
                        : 'bg-[#121620]/60 border-[#1A202C] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 focus:outline-none"
                        aria-label={fix.accepted ? 'Reject this fix' : 'Accept this fix'}
                      >
                        {fix.accepted ? (
                          <CheckSquare className="w-4 h-4 text-[#38BDF8]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                              meta ? meta.badgeColor : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {meta ? meta.title : fix.category}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {fix.confidence.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium leading-snug">
                          {fix.description}
                        </p>
                        {fix.beforeSnippet && (
                          <div className="mt-2 text-[11px] font-mono bg-[#0B0D13] p-1.5 rounded border border-[#1A202C] flex items-center gap-1 text-slate-400">
                            <span className="text-rose-400 truncate max-w-[90px]">{fix.beforeSnippet}</span>
                            <span>&rarr;</span>
                            <span className="text-emerald-400 truncate max-w-[90px]">{fix.afterSnippet}</span>
                          </div>
                        )}
                        {fix.dependsOn && (
                          <p className="mt-1 text-[10px] text-amber-400/80">
                            Depends on: {fix.dependsOn.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {fixes.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No automated repairs available for this input.
                </div>
              )}
            </div>

            {/* Validation Outcome of Current Selection */}
            <div className="mt-3 pt-3 border-t border-[#1A202C]">
              {evaluation.isValid ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Valid JSON Outcome</span>
                    <span className="text-[11px] text-emerald-400/80">
                      RFC 8259 syntax verified via strict parser.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">This selection produces invalid JSON</span>
                    <span className="text-[11px] text-rose-400/80 leading-relaxed block mt-0.5">
                      The selected fixes cannot be applied independently. Please select the required dependent fix.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Area: Side-by-Side Diff */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden bg-[#0A0D14]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Side-by-Side Visual Diff
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500/60 inline-block"></span>
                  Original
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/60 inline-block"></span>
                  Repaired
                </span>
              </div>
            </div>

            <SideBySideDiff
              originalText={originalText}
              proposedText={evaluation.repairedText}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[#1A202C] bg-[#121620]">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero server transmissions · All validations executed client-side</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1A202C] border border-[#262D3D] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!evaluation.isValid || evaluation.activeFixCount === 0}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                evaluation.isValid && evaluation.activeFixCount > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Apply {evaluation.activeFixCount > 0 ? `${evaluation.activeFixCount} ` : ''}Selected Fix{evaluation.activeFixCount !== 1 ? 'es' : ''}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
