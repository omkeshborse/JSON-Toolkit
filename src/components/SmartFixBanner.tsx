import React, { useState } from 'react';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { JsonErrorDiagnostic, RepairCandidate } from '../utils/jsonEngine/types';
import { ERROR_CATEGORIES } from '../utils/jsonEngine/errorCategories';
import { FixInspectorModal } from './FixInspectorModal';
import { QuickFixPreviewModal } from './QuickFixPreviewModal';
import { buildProposedFixItems, ProposedFixItem } from '../utils/jsonEngine/fixInspector';

interface SmartFixBannerProps {
  diagnostics: JsonErrorDiagnostic[];
  candidate: RepairCandidate | null;
  rawInput?: string;
  onApplyFix: (fixedText: string) => void;
  onUndoFix?: () => void;
  canUndo?: boolean;
  className?: string;
}

export const SmartFixBanner: React.FC<SmartFixBannerProps> = ({
  diagnostics,
  candidate,
  rawInput = '',
  onApplyFix,
  onUndoFix,
  canUndo = false,
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [quickFixTarget, setQuickFixTarget] = useState<ProposedFixItem | null>(null);

  // Group error counts by category
  const errorSummary: Record<string, number> = {};
  for (const d of diagnostics) {
    errorSummary[d.code] = (errorSummary[d.code] || 0) + 1;
  }

  const categories = Object.keys(errorSummary);
  const canFix = Boolean(
    candidate &&
    candidate.isValid &&
    candidate.confidence !== 'low' &&
    candidate.changes.length > 0
  );

  // Compute proposed fix items for single vs multi fix logic
  const proposedItems = React.useMemo(() => {
    if (!rawInput.trim() || !canFix) return [];
    return buildProposedFixItems(rawInput);
  }, [rawInput, canFix]);

  const isSingleFix = proposedItems.length === 1 && candidate?.confidence === 'high';

  if (diagnostics.length === 0 && !canUndo) {
    return null;
  }

  return (
    <>
      <div
        className={`p-3.5 rounded-xl border transition-all ${
          canFix
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-rose-500/10 border-rose-500/30'
        } ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Summary & Confidence */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Error Count Badge */}
            {diagnostics.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{diagnostics.length} Syntax {diagnostics.length === 1 ? 'Error' : 'Errors'}</span>
              </div>
            )}

            {/* Confidence Badge */}
            {candidate && candidate.isValid && candidate.confidence !== 'low' ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  {candidate.confidence === 'high'
                    ? 'Deterministic Safe Fix (100%)'
                    : 'Balanced Fix (88%)'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                <Info className="w-3 h-3 text-slate-500" />
                <span>🔴 Unable to safely repair automatically. Manual fix required.</span>
              </div>
            )}

            {/* Category Chips */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
              {categories.map((catKey) => {
                const meta = ERROR_CATEGORIES[catKey as keyof typeof ERROR_CATEGORIES];
                if (!meta) return null;
                return (
                  <span
                    key={catKey}
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                  >
                    {meta.title} {errorSummary[catKey] > 1 ? `(${errorSummary[catKey]})` : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {canUndo && onUndoFix && (
              <button
                onClick={onUndoFix}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
                title="Revert to original input before Smart Fix"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Fix</span>
              </button>
            )}

            {/* If Single Fix: Offer Quick Fix with Compact Confirmation Preview */}
            {canFix && isSingleFix && (
              <button
                onClick={() => setQuickFixTarget(proposedItems[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer shadow-xs"
                title="Open compact Quick Fix preview"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Quick Fix</span>
              </button>
            )}

            {/* Interactive Inspector Button (Shown for single or multi-fix) */}
            {canFix && (
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161C28] hover:bg-[#1E2638] text-slate-200 border border-[#262D3D] hover:border-[#38BDF8]/60 text-xs font-medium transition cursor-pointer shadow-sm"
                title="Open Side-by-Side Visual Diff & Fix Inspector"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>
                  {proposedItems.length > 1
                    ? `Inspect ${proposedItems.length} Fixes`
                    : 'Inspect Fix'}
                </span>
              </button>
            )}

            {/* 1-Click Apply */}
            {canFix && (
              <button
                onClick={() => onApplyFix(candidate.repaired)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>1-Click Smart Fix</span>
              </button>
            )}

            {candidate && candidate.changes.length > 0 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showDetails ? 'Hide fix details' : 'Show fix details'}
              >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Details Pane */}
        {showDetails && candidate && candidate.changes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2">
            <div className="text-slate-400 font-medium flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Deterministic Changes Ready to Apply:</span>
              </div>
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Diff &amp; Inspector &rarr;</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {candidate.changes.map((change, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">{change.description}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Category: {ERROR_CATEGORIES[change.category]?.title || change.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Fix Compact Confirmation Modal */}
      {quickFixTarget && candidate && (
        <QuickFixPreviewModal
          isOpen={Boolean(quickFixTarget)}
          onClose={() => setQuickFixTarget(null)}
          fix={quickFixTarget}
          onConfirmApply={() => {
            onApplyFix(candidate.repaired);
            setQuickFixTarget(null);
          }}
        />
      )}

      {/* Modal Visual Diff & Fix Inspector */}
      {isInspectorOpen && (
        <FixInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          originalText={rawInput || candidate?.original || ''}
          onApplyFix={(fixedText) => {
            onApplyFix(fixedText);
            setIsInspectorOpen(false);
          }}
        />
      )}
    </>
  );
};
