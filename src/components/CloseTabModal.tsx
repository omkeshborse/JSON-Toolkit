import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CloseTabModalProps {
  isOpen: boolean;
  tabTitle: string;
  onConfirmClose: () => void;
  onCancel: () => void;
}

export const CloseTabModal: React.FC<CloseTabModalProps> = ({
  isOpen,
  tabTitle,
  onConfirmClose,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-modal-title"
    >
      <div className="bg-[#121620] border border-[#262D3D] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="close-modal-title" className="text-sm font-semibold text-white">
                Close &quot;{tabTitle}&quot;?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This document contains unsaved changes. Closing it will discard your work.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-[#1A202C] text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Cancel closing tab"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white text-xs font-medium border border-[#262D3D] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmClose}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Close Tab
          </button>
        </div>
      </div>
    </div>
  );
};
