import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { ProposedFixItem } from '../utils/jsonEngine/fixInspector';

interface QuickFixPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fix: ProposedFixItem;
  originalSnippet?: string;
  proposedSnippet?: string;
  onConfirmApply: () => void;
}

export const QuickFixPreviewModal: React.FC<QuickFixPreviewModalProps> = ({
  isOpen,
  onClose,
  fix,
  onConfirmApply,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-fix-title"
    >
      <div className="w-full max-w-md bg-[#0E131F] border border-[#262D3D] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A202C] bg-[#121620]">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <h3 id="quick-fix-title" className="text-sm font-semibold text-white">
              Confirm Quick Fix
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">{fix.description}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              HIGH CONFIDENCE
            </span>
          </div>

          {/* Snippet Before vs After */}
          {fix.beforeSnippet && (
            <div className="p-3 rounded-lg bg-[#0B0D13] border border-[#1A202C] space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans mb-1">
                  Before
                </span>
                <div className="px-2 py-1 rounded bg-rose-950/20 text-rose-300 border border-rose-500/30 break-all whitespace-pre-wrap">
                  {fix.beforeSnippet}
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-500 py-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans mb-1">
                  After
                </span>
                <div className="px-2 py-1 rounded bg-emerald-950/20 text-emerald-300 border border-emerald-500/30 break-all whitespace-pre-wrap">
                  {fix.afterSnippet}
                </div>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Applying this fix will update your editor and validate strictly against RFC 8259. You can undo anytime.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#121620] border-t border-[#1A202C]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmApply();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply Fix
          </button>
        </div>
      </div>
    </div>
  );
};
