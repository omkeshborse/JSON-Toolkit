import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ResizableEditorSplitProps {
  left: React.ReactNode;
  right: React.ReactNode;
  isFullscreen?: boolean;
  storageKey?: string;
}

const DEFAULT_SPLIT = 50; // 50%
const MIN_SPLIT = 20; // 20%
const MAX_SPLIT = 80; // 80%

export const ResizableEditorSplit: React.FC<ResizableEditorSplitProps> = ({
  left,
  right,
  isFullscreen = false,
  storageKey = '101_json_toolkit_editor_split_ratio',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_SPLIT && parsed <= MAX_SPLIT) {
          return parsed;
        }
      }
    } catch {
      // LocalStorage access may fail in restricted contexts
    }
    return DEFAULT_SPLIT;
  });

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Sync state to ref for document listeners
  isDraggingRef.current = isDragging;

  const saveRatio = useCallback(
    (val: number) => {
      try {
        localStorage.setItem(storageKey, val.toFixed(2));
      } catch {
        // LocalStorage quota or disabled
      }
    },
    [storageKey]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    // Use pointer capture if available
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSplitRatio(DEFAULT_SPLIT);
    saveRatio(DEFAULT_SPLIT);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const offsetX = e.clientX - rect.left;
      let newPercent = (offsetX / rect.width) * 100;

      // Clamp between 20% and 80%
      if (newPercent < MIN_SPLIT) newPercent = MIN_SPLIT;
      if (newPercent > MAX_SPLIT) newPercent = MAX_SPLIT;

      setSplitRatio(newPercent);
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        setIsDragging(false);
        setSplitRatio((current) => {
          saveRatio(current);
          return current;
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [saveRatio]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col lg:flex-row ${
        isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
      } ${isDragging ? 'select-none cursor-col-resize' : ''}`}
    >
      {/* Input JSON Editor Frame */}
      <div
        className="w-full lg:w-auto h-full min-h-0 flex flex-col overflow-hidden"
        style={{
          // On desktop (lg+), use calculated flexBasis percentage; on mobile, default 100%
          flexBasis: `${splitRatio}%`,
          flexGrow: 0,
          flexShrink: 0,
        }}
      >
        {left}
      </div>

      {/* VS Code-style Draggable Divider with 3-dot Grip Handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(splitRatio)}
        aria-valuemin={MIN_SPLIT}
        aria-valuemax={MAX_SPLIT}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setSplitRatio((prev) => {
              const next = Math.max(MIN_SPLIT, prev - 2);
              saveRatio(next);
              return next;
            });
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setSplitRatio((prev) => {
              const next = Math.min(MAX_SPLIT, prev + 2);
              saveRatio(next);
              return next;
            });
          } else if (e.key === 'Home' || e.key === 'Enter') {
            e.preventDefault();
            setSplitRatio(DEFAULT_SPLIT);
            saveRatio(DEFAULT_SPLIT);
          }
        }}
        title="Drag to resize editor panes • Double-click to reset 50/50"
        aria-label="Resize editor panels"
        className={`hidden lg:flex items-center justify-center shrink-0 w-3 cursor-col-resize relative group z-10 transition-colors mx-0.5 touch-none ${
          isDragging ? 'bg-[#38BDF8]/20' : 'hover:bg-[#38BDF8]/10'
        }`}
      >
        {/* Subtle center hairline matching VS Code divider */}
        <div
          className={`absolute inset-y-0 w-px transition-colors ${
            isDragging
              ? 'bg-[#38BDF8]'
              : 'bg-[#262D3D] group-hover:bg-[#38BDF8]/70'
          }`}
        />

        {/* Small three-dot grip handle directly on divider */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center gap-1 py-2 px-0.5 rounded-full border transition-all ${
            isDragging
              ? 'bg-[#121620] border-[#38BDF8] text-[#38BDF8] shadow-sm shadow-[#38BDF8]/20'
              : 'bg-[#121620]/90 border-[#262D3D] text-slate-500 group-hover:border-[#38BDF8]/50 group-hover:text-[#38BDF8]'
          }`}
        >
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </div>
      </div>

      {/* Mobile-only spacer between stacked frames */}
      <div className="lg:hidden h-4 shrink-0" />

      {/* Formatted Output Editor Frame */}
      <div
        className="w-full lg:w-auto h-full min-h-0 flex flex-col overflow-hidden"
        style={{
          flexBasis: `calc(${100 - splitRatio}% - 0.75rem)`,
          flexGrow: 1,
          flexShrink: 1,
        }}
      >
        {right}
      </div>
    </div>
  );
};
