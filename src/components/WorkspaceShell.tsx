import React, { useState } from 'react';
import { WorkspaceTabBar } from './WorkspaceTabBar';
import { CloseTabModal } from './CloseTabModal';
import { useWorkspace } from '../context/WorkspaceContext';
import { Minimize2, Maximize2, Expand, Shrink } from 'lucide-react';

interface WorkspaceShellProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  controlsRight?: React.ReactNode;
  showExpand?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  children,
  title,
  actions,
  controlsRight,
  showExpand = true,
  showFullscreen = true,
  className = '',
  onShowToast,
}) => {
  const {
    tabs,
    activeTabId,
    activeTab,
    selectTab,
    newTab,
    closeTab,
    renameTab,
    duplicateTab,
    workspaceMode,
    toggleExpand,
    toggleFullscreen,
    exitFullscreen,
  } = useWorkspace();

  const [tabToClose, setTabToClose] = useState<{ id: string; title: string } | null>(null);

  const isFullscreen = workspaceMode === 'fullscreen';
  const isExpanded = workspaceMode === 'expanded';

  const handleRequestCloseTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    if (target.isDirty && target.inputJson.trim().length > 0) {
      setTabToClose({ id: target.id, title: target.title });
    } else {
      closeTab(id);
    }
  };

  const handleConfirmClose = () => {
    if (tabToClose) {
      closeTab(tabToClose.id);
      if (onShowToast) onShowToast(`Closed "${tabToClose.title}"`, 'info');
      setTabToClose(null);
    }
  };

  const handleCreateNewTab = () => {
    newTab();
    if (onShowToast) onShowToast('Created new JSON document', 'info');
  };

  const handleRename = (id: string, newTitle: string) => {
    renameTab(id, newTitle);
    if (onShowToast) onShowToast(`Renamed tab to "${newTitle}"`, 'success');
  };

  const handleDuplicate = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    duplicateTab(id);
    if (onShowToast && target) onShowToast(`Duplicated "${target.title}"`, 'success');
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full transition-all duration-200 ${
        isExpanded ? 'max-w-[96vw]' : 'max-w-7xl'
      } ${className}`}
    >
      {/* Global Tab Bar in normal/expanded page mode */}
      <WorkspaceTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={selectTab}
        onNewTab={handleCreateNewTab}
        onCloseTab={handleRequestCloseTab}
        onRenameTab={handleRename}
        onDuplicateTab={handleDuplicate}
      />

      {/* Workspace Toolbar (Actions on left, Indentation/Tools + Expand/Fullscreen on right) */}
      {(actions || controlsRight || showExpand || showFullscreen) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121620] border border-[#1A202C] rounded-xl mb-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">{actions}</div>

          <div className="flex flex-wrap items-center gap-3">
            {controlsRight}

            {(showExpand || showFullscreen) && controlsRight && (
              <div className="h-4 w-px bg-[#262D3D] hidden sm:block" />
            )}

            {/* Expand / Restore Button */}
            {showExpand && !isFullscreen && (
              <button
                type="button"
                onClick={toggleExpand}
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

            {/* Fullscreen Button */}
            {showFullscreen && (
              <button
                type="button"
                onClick={toggleFullscreen}
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
            )}
          </div>
        </div>
      )}

      {/* Main Workspace Body (Normal vs Fullscreen) */}
      <div
        role="tabpanel"
        aria-label={`${activeTab.title} Workspace`}
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-[#0B0D13] w-screen h-screen overflow-hidden p-3 sm:p-4 shadow-2xl animate-in fade-in duration-150'
            : 'w-full mb-6'
        }
      >
        {/* Fullscreen Workspace Header & Tabs Bar */}
        {isFullscreen && (
          <div className="flex flex-col gap-2 mb-3 shrink-0">
            <div className="flex items-center justify-between px-3 py-2 bg-[#121620] border border-[#262D3D] rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white tracking-wide">
                    {title} — {activeTab.title}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A202C] text-[#38BDF8] border border-[#262D3D]">
                    Side-by-Side View
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {actions}

                <button
                  type="button"
                  onClick={exitFullscreen}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D] font-medium transition cursor-pointer text-xs"
                  title="Exit fullscreen (Esc)"
                  aria-label="Exit JSON workspace fullscreen"
                >
                  <Shrink className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            <WorkspaceTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={selectTab}
              onNewTab={handleCreateNewTab}
              onCloseTab={handleRequestCloseTab}
              onRenameTab={handleRename}
              onDuplicateTab={handleDuplicate}
            />
          </div>
        )}

        {/* Content provided by individual tools */}
        {children}
      </div>

      {/* Confirmation Modal when Closing a Dirty Tab */}
      <CloseTabModal
        isOpen={tabToClose !== null}
        tabTitle={tabToClose?.title || ''}
        onConfirmClose={handleConfirmClose}
        onCancel={() => setTabToClose(null)}
      />
    </div>
  );
};
