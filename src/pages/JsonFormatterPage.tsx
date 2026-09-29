import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SmartFixBanner } from '../components/SmartFixBanner';
import { SeoContentSection } from '../components/SeoContentSection';
import { WorkspaceTabBar } from '../components/WorkspaceTabBar';
import { CloseTabModal } from '../components/CloseTabModal';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { SAMPLE_DATASETS } from '../data/samples';
import { JsonEngine } from '../utils/jsonEngine';
import {
  JsonWorkspaceTab,
  createInitialTab,
  loadWorkspaceFromStorage,
  saveWorkspaceToStorage,
} from '../types/workspace';
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
  Maximize2,
  Sliders,
  Expand,
  Shrink,
  Wand2,
} from 'lucide-react';

export const JsonFormatterPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  // Multi-tab Workspace State
  const [tabs, setTabs] = useState<JsonWorkspaceTab[]>(() => {
    const saved = loadWorkspaceFromStorage();
    if (saved && saved.tabs.length > 0) return saved.tabs;
    return [createInitialTab('Untitled JSON', JSON.stringify(SAMPLE_DATASETS[0].data, null, 2))];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = loadWorkspaceFromStorage();
    if (saved && saved.activeTabId && saved.tabs.some((t) => t.id === saved.activeTabId)) {
      return saved.activeTabId;
    }
    return tabs[0]?.id || 'tab-initial';
  });

  // Modal state for closing dirty tabs
  const [tabToClose, setTabToClose] = useState<JsonWorkspaceTab | null>(null);

  // Common Workspace UI State (normal | expanded | fullscreen)
  const [workspaceMode, setWorkspaceMode] = useState<'normal' | 'expanded' | 'fullscreen'>('normal');

  const workspaceContainerRef = useRef<HTMLDivElement>(null);

  // Active Tab Reference
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0] || createInitialTab();
  }, [tabs, activeTabId]);

  // Persist workspace changes with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      saveWorkspaceToStorage(tabs, activeTabId);
    }, 400);
    return () => clearTimeout(timer);
  }, [tabs, activeTabId]);

  // Unified validation for ACTIVE TAB via shared JsonEngine
  const validation = useMemo(() => {
    return JsonEngine.validate(activeTab.inputJson);
  }, [activeTab.inputJson]);

  const { isValid, data: parsed, error, line, diagnostics, candidate } = validation;

  // Helper to update active tab document state
  const updateActiveTab = useCallback(
    (updater: Partial<JsonWorkspaceTab> | ((prev: JsonWorkspaceTab) => Partial<JsonWorkspaceTab>)) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;
          const patch = typeof updater === 'function' ? updater(tab) : updater;
          return {
            ...tab,
            ...patch,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [activeTabId]
  );

  // Tab Operations
  const handleSelectTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const handleNewTab = useCallback(() => {
    setTabs((prev) => {
      const count = prev.length + 1;
      const newTitle = `Untitled JSON ${count > 1 ? count : ''}`.trim();
      const newTab = createInitialTab(newTitle, '');
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
    onShowToast('Created new JSON document', 'info');
  }, [onShowToast]);

  const executeCloseTab = useCallback((targetTabId: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === targetTabId);
      if (idx === -1) return prev;

      const remaining = prev.filter((t) => t.id !== targetTabId);

      // If closing the last tab, automatically create a fresh Untitled JSON tab
      if (remaining.length === 0) {
        const fresh = createInitialTab('Untitled JSON', '');
        setActiveTabId(fresh.id);
        return [fresh];
      }

      // If closing the active tab, switch to adjacent tab
      if (targetTabId === activeTabId) {
        const nextActive = remaining[Math.min(idx, remaining.length - 1)];
        setActiveTabId(nextActive.id);
      }

      return remaining;
    });
  }, [activeTabId]);

  const handleRequestCloseTab = useCallback((targetTabId: string) => {
    const target = tabs.find((t) => t.id === targetTabId);
    if (!target) return;

    if (target.isDirty && target.inputJson.trim().length > 0) {
      setTabToClose(target);
    } else {
      executeCloseTab(targetTabId);
    }
  }, [tabs, executeCloseTab]);

  const handleConfirmCloseTab = useCallback(() => {
    if (tabToClose) {
      executeCloseTab(tabToClose.id);
      setTabToClose(null);
      onShowToast(`Closed "${tabToClose.title}"`, 'info');
    }
  }, [tabToClose, executeCloseTab, onShowToast]);

  const handleRenameTab = useCallback((id: string, newTitle: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle, updatedAt: Date.now() } : t))
    );
    onShowToast(`Renamed tab to "${newTitle}"`, 'success');
  }, [onShowToast]);

  const handleDuplicateTab = useCallback((id: string) => {
    const source = tabs.find((t) => t.id === id);
    if (!source) return;
    const now = Date.now();
    const copyTab: JsonWorkspaceTab = {
      ...source,
      id: `tab-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: `${source.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    setTabs((prev) => [...prev, copyTab]);
    setActiveTabId(copyTab.id);
    onShowToast(`Duplicated "${source.title}"`, 'success');
  }, [tabs, onShowToast]);

  // Safe Keyboard Shortcuts (Alt+N for new tab, Alt+W for close active tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleNewTab();
      } else if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        handleRequestCloseTab(activeTabId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewTab, handleRequestCloseTab, activeTabId]);

  // Document Format Action
  const handleFormat = () => {
    if (!activeTab.inputJson.trim()) {
      onShowToast('Please provide JSON to format', 'info');
      return;
    }
    if (!isValid || parsed === null) {
      onShowToast('Cannot format invalid JSON. Use Smart Fix or Inspect Fixes to resolve syntax errors.', 'error');
      return;
    }
    try {
      const indent = activeTab.indentation === 'tab' ? '\t' : activeTab.indentation;
      const formatted = JsonEngine.format(activeTab.inputJson, { indent });
      updateActiveTab({ outputJson: formatted, isDirty: true });
      onShowToast(`Formatted JSON (${activeTab.indentation === 'tab' ? 'Tabs' : `${activeTab.indentation} spaces`})`, 'success');
    } catch {
      onShowToast('Cannot format invalid JSON', 'error');
    }
  };

  // Smart Fix Action triggered explicitly by user
  const handleApplySmartFix = (fixedText: string) => {
    const indent = activeTab.indentation === 'tab' ? '\t' : activeTab.indentation;
    let formattedOutput = fixedText;
    try {
      formattedOutput = JsonEngine.format(fixedText, { indent });
    } catch {
      // fallback to plain fixed text
    }

    updateActiveTab({
      undoInput: activeTab.inputJson,
      inputJson: fixedText,
      outputJson: formattedOutput,
      isDirty: true,
    });

    onShowToast('Deterministic Smart Fix applied & formatted successfully!', 'success');
  };

  const handleUndoFix = () => {
    if (activeTab.undoInput !== null) {
      updateActiveTab({
        inputJson: activeTab.undoInput,
        undoInput: null,
        isDirty: true,
      });
      onShowToast('Reverted to original input', 'info');
    }
  };

  // Minify Action
  const handleMinify = () => {
    if (!isValid || parsed === null) {
      onShowToast('Cannot minify invalid JSON', 'error');
      return;
    }
    try {
      const minified = JsonEngine.minify(activeTab.inputJson);
      updateActiveTab({ outputJson: minified, isDirty: true });
      onShowToast('Minified JSON to compact representation', 'success');
    } catch {
      onShowToast('Cannot minify invalid JSON', 'error');
    }
  };

  // Validate Action
  const handleValidate = () => {
    if (!activeTab.inputJson.trim()) {
      onShowToast('Please enter or paste JSON to validate', 'info');
      return;
    }
    if (isValid) {
      onShowToast('Valid JSON syntax conforming to RFC 8259', 'success');
    } else {
      onShowToast(error || `${diagnostics.length} syntax error(s) detected`, 'error');
    }
  };

  // Clear Action
  const handleClear = () => {
    updateActiveTab({
      inputJson: '',
      outputJson: '',
      undoInput: null,
      isDirty: false,
    });
    onShowToast(`Cleared document "${activeTab.title}"`, 'info');
  };

  // Reset to sample dataset on active tab only
  const handleResetSample = () => {
    const s = JSON.stringify(SAMPLE_DATASETS[0].data, null, 2);
    updateActiveTab({
      inputJson: s,
      outputJson: s,
      undoInput: null,
      isDirty: false,
    });
    onShowToast(`Loaded sample dataset into "${activeTab.title}"`, 'info');
  };

  // Download Action for active tab
  const handleDownload = () => {
    const content = activeTab.outputJson || activeTab.inputJson;
    if (!content) {
      onShowToast('No JSON to download in this tab', 'error');
      return;
    }
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = activeTab.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${sanitizedTitle || 'document'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateActiveTab({ isDirty: false });
    onShowToast(`Downloaded ${a.download}`, 'success');
  };

  // Common Workspace Fullscreen Toggle
  const handleToggleWorkspaceFullscreen = () => {
    setWorkspaceMode((prev) => {
      const next = prev === 'fullscreen' ? 'normal' : 'fullscreen';
      if (next === 'fullscreen') {
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  // Common Workspace Expand Toggle (horizontal width expansion)
  const handleToggleWorkspaceExpand = () => {
    setWorkspaceMode((prev) => (prev === 'expanded' ? 'normal' : 'expanded'));
  };

  // Exit fullscreen callback
  const exitWorkspaceFullscreen = useCallback(() => {
    setWorkspaceMode('normal');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle Escape key & fullscreenchange event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (workspaceMode === 'fullscreen') {
          exitWorkspaceFullscreen();
        } else if (workspaceMode === 'expanded') {
          setWorkspaceMode('normal');
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && workspaceMode === 'fullscreen') {
        setWorkspaceMode('normal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [workspaceMode, exitWorkspaceFullscreen]);

  // Lock background scroll only when workspace is in fullscreen mode
  useEffect(() => {
    if (workspaceMode === 'fullscreen') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [workspaceMode]);

  const canSmartFix = Boolean(candidate && candidate.isValid && candidate.confidence !== 'low');

  const isFullscreen = workspaceMode === 'fullscreen';
  const isExpanded = workspaceMode === 'expanded';

  // Custom output panel download button
  const outputDownloadAction = (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!activeTab.outputJson && !activeTab.inputJson}
      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border border-[#262D3D] text-xs transition-colors cursor-pointer disabled:opacity-50"
      title="Download active tab JSON file"
      aria-label="Download active tab JSON"
    >
      <Download className="w-3 h-3 text-[#34D399]" />
      <span className="hidden sm:inline">Download</span>
    </button>
  );

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full transition-all duration-200 ${
        isExpanded ? 'max-w-[96vw]' : 'max-w-7xl'
      }`}
    >
      <Breadcrumb items={[{ label: 'JSON Formatter' }]} />

      <ToolHeader
        title="JSON Formatter & Beautifier"
        description="Clean, indent, and format multiple JSON documents simultaneously with isolated browser-style tabs."
        icon={Braces}
        badge="Zero-Lag Parser"
        actions={
          <>
            <button
              onClick={handleResetSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample</span>
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Tab</span>
            </button>
          </>
        }
      />

      {/* Browser-style Multi-Tab Workspace Bar */}
      <WorkspaceTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onNewTab={handleNewTab}
        onCloseTab={handleRequestCloseTab}
        onRenameTab={handleRenameTab}
        onDuplicateTab={handleDuplicateTab}
      />

      {/* Control bar with Common Format, Minify, Validate, Indentation & Expand/Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121620] border border-[#1A202C] rounded-xl mb-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Format */}
          <button
            onClick={handleFormat}
            className="px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Format JSON</span>
          </button>

          {/* Minify Action */}
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Minify</span>
          </button>

          {/* Validate Action */}
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Validate</span>
          </button>
        </div>

        {/* Right side settings: Indentation selector + Common Expand & Fullscreen Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Indentation:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0D13] p-0.5 rounded-lg border border-[#262D3D]">
            {([2, 4, 3, 'tab'] as const).map((indent) => (
              <button
                key={indent}
                onClick={() => {
                  const formattedIndent = indent === 'tab' ? '\t' : indent;
                  let newOutput = activeTab.outputJson;
                  if (parsed !== null) {
                    newOutput = JSON.stringify(parsed, null, formattedIndent);
                  }
                  updateActiveTab({ indentation: indent, outputJson: newOutput, isDirty: true });
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  activeTab.indentation === indent
                    ? 'bg-[#121620] text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {indent === 'tab' ? 'Tabs' : `${indent}s`}
              </button>
            ))}
          </div>

          {/* Separator before Workspace Expand/Fullscreen */}
          <div className="h-4 w-px bg-[#262D3D] hidden sm:block" />

          {/* Expand / Restore Button (horizontal workspace expansion) */}
          {!isFullscreen && (
            <button
              type="button"
              onClick={handleToggleWorkspaceExpand}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isExpanded
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border-[#262D3D]'
              }`}
              title={isExpanded ? 'Restore normal workspace width' : 'Expand workspace horizontally across page'}
              aria-label={isExpanded ? 'Restore JSON workspace width' : 'Expand JSON workspace width'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'Restore' : 'Expand'}</span>
            </button>
          )}

          {/* Fullscreen Workspace Toggle Button */}
          <button
            type="button"
            onClick={handleToggleWorkspaceFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
              isFullscreen
                ? 'bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90'
                : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D]'
            }`}
            title={isFullscreen ? 'Exit fullscreen workspace (Esc)' : 'Open JSON workspace in fullscreen'}
            aria-label={isFullscreen ? 'Exit JSON workspace fullscreen' : 'Open JSON workspace in fullscreen'}
          >
            {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Smart Fix Banner when errors detected on ACTIVE TAB */}
      {!isValid && activeTab.inputJson.trim() && (
        <div className="mb-4">
          <SmartFixBanner
            key={`smartfix-${activeTabId}`}
            diagnostics={diagnostics}
            candidate={candidate}
            rawInput={activeTab.inputJson}
            onApplyFix={handleApplySmartFix}
            onUndoFix={handleUndoFix}
            canUndo={activeTab.undoInput !== null}
          />
        </div>
      )}

      {/* Undo Banner if currently fixed on ACTIVE TAB */}
      {isValid && activeTab.undoInput !== null && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Smart Fix applied to &quot;{activeTab.title}&quot;. Document is valid JSON.</span>
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

      {/* COMMON WORKSPACE (Input JSON 50% | Formatted Output 50%) */}
      <div
        ref={workspaceContainerRef}
        role="tabpanel"
        aria-label={`${activeTab.title} Workspace`}
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-[#0B0D13] w-screen h-screen overflow-hidden p-3 sm:p-4 shadow-2xl animate-in fade-in duration-150'
            : 'w-full mb-6'
        }
      >
        {/* Fullscreen Workspace Header Bar with Tabs support */}
        {isFullscreen && (
          <div className="flex flex-col gap-2 mb-3 shrink-0">
            <div className="flex items-center justify-between px-3 py-2 bg-[#121620] border border-[#262D3D] rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white tracking-wide">
                    JSON Workspace — {activeTab.title}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A202C] text-[#38BDF8] border border-[#262D3D]">
                    Side-by-Side View
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormat}
                  className="px-2.5 py-1 rounded bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">Format JSON</span>
                </button>

                <button
                  type="button"
                  onClick={exitWorkspaceFullscreen}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D] font-medium transition cursor-pointer text-xs"
                  title="Exit fullscreen (Esc)"
                  aria-label="Exit JSON workspace fullscreen"
                >
                  <Shrink className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            {/* In-Fullscreen Tab Switcher */}
            <WorkspaceTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={handleSelectTab}
              onNewTab={handleNewTab}
              onCloseTab={handleRequestCloseTab}
              onRenameTab={handleRenameTab}
              onDuplicateTab={handleDuplicateTab}
            />
          </div>
        )}

        {/* Side-by-side Equal-Height Editors Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          {/* Input Editor (50% desktop width, 100% grid row height) */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`input-${activeTabId}`}
              title={`Input JSON (${activeTab.title})`}
              value={activeTab.inputJson}
              onChange={(val) => {
                updateActiveTab((prev) => {
                  let newOutput = prev.outputJson;
                  try {
                    const p = JSON.parse(val);
                    const indent = prev.indentation === 'tab' ? '\t' : prev.indentation;
                    newOutput = JSON.stringify(p, null, indent);
                  } catch {
                    // keep output during syntax transition
                  }
                  return {
                    inputJson: val,
                    outputJson: newOutput,
                    undoInput: null,
                    isDirty: true,
                  };
                });
              }}
              placeholder="Paste raw unformatted or formatted JSON..."
              error={error}
              errorLine={line}
              diagnostics={diagnostics}
              canSmartFix={canSmartFix}
              onSmartFix={() => candidate && handleApplySmartFix(candidate.repaired)}
              heightClass="h-full"
            />
          </div>

          {/* Formatted Output Editor (50% desktop width, 100% grid row height) */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              key={`output-${activeTabId}`}
              title={`Formatted Output (${activeTab.title})`}
              value={activeTab.outputJson}
              onChange={(val) => updateActiveTab({ outputJson: val, isDirty: true })}
              readOnly
              placeholder="Formatted JSON will appear here..."
              heightClass="h-full"
              extraActions={outputDownloadAction}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal when Closing a Dirty Tab */}
      <CloseTabModal
        isOpen={tabToClose !== null}
        tabTitle={tabToClose?.title || ''}
        onConfirmClose={handleConfirmCloseTab}
        onCancel={() => setTabToClose(null)}
      />

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-formatter']} />
    </div>
  );
};
export default JsonFormatterPage;
