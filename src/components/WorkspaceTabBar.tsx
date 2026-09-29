import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, MoreVertical, Edit2, Copy, FileText } from 'lucide-react';
import { JsonWorkspaceTab } from '../types/workspace';

interface WorkspaceTabBarProps {
  tabs: JsonWorkspaceTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onNewTab: () => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, newTitle: string) => void;
  onDuplicateTab: (id: string) => void;
}

export const WorkspaceTabBar: React.FC<WorkspaceTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onRenameTab,
  onDuplicateTab,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [contextMenuTabId, setContextMenuTabId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus inline edit input
  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuTabId(null);
      }
    };
    if (contextMenuTabId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [contextMenuTabId]);

  const handleStartRename = (tab: JsonWorkspaceTab, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
    setContextMenuTabId(null);
  };

  const handleCommitRename = (id: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      onRenameTab(id, trimmed);
    }
    setEditingTabId(null);
  };

  const handleCancelRename = () => {
    setEditingTabId(null);
  };

  return (
    <div className="flex items-center bg-[#0F1117] border border-[#1A202C] rounded-xl px-1.5 py-1 mb-4 select-none relative overflow-hidden">
      {/* Scrollable Tabs List */}
      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label="JSON Workspace tabs"
        className="flex items-center gap-1 overflow-x-auto flex-1 scrollbar-none py-0.5 min-w-0"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = tab.id === editingTabId;

          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectTab(tab.id)}
              onDoubleClick={(e) => handleStartRename(tab, e)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer max-w-[200px] shrink-0 border ${
                isActive
                  ? 'bg-[#1A202C] text-white border-[#262D3D] shadow-xs'
                  : 'bg-[#121620]/60 text-slate-400 hover:text-slate-200 hover:bg-[#121620] border-transparent'
              }`}
              title={`${tab.title}${tab.isDirty ? ' (unsaved changes)' : ''}`}
            >
              <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#38BDF8]' : 'text-slate-500'}`} />

              {/* Title / Inline Rename */}
              {isEditing ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitRename(tab.id);
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  onBlur={() => handleCommitRename(tab.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0B0D13] text-white px-1.5 py-0.5 rounded border border-[#38BDF8] text-xs font-medium w-28 focus:outline-none"
                  aria-label="Rename document tab"
                />
              ) : (
                <span className="truncate max-w-[110px] select-none text-left">
                  {tab.title}
                </span>
              )}

              {/* Dirty indicator */}
              {tab.isDirty && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                  title="Unsaved changes in this tab"
                  aria-label="Unsaved changes"
                />
              )}

              {/* Tab menu trigger (visible on hover or active) */}
              <div className="flex items-center gap-0.5 ml-auto shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuTabId((prev) => (prev === tab.id ? null : tab.id));
                  }}
                  className={`p-0.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition cursor-pointer ${
                    isActive ? 'opacity-70 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-70'
                  }`}
                  title="Tab options"
                  aria-label={`Options for ${tab.title}`}
                >
                  <MoreVertical className="w-3 h-3" />
                </button>

                {/* Close Tab Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title={`Close ${tab.title}`}
                  aria-label={`Close ${tab.title}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Context Menu Dropdown */}
              {contextMenuTabId === tab.id && (
                <div
                  ref={menuRef}
                  className="absolute top-full left-0 mt-1 z-50 w-36 bg-[#161B26] border border-[#262D3D] rounded-lg shadow-xl py-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    type="button"
                    onClick={(e) => handleStartRename(tab, e)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#202736] text-left transition cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    <span>Rename</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateTab(tab.id);
                      setContextMenuTabId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#202736] text-left transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Duplicate</span>
                  </button>

                  <div className="h-px bg-[#262D3D] my-1" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                      setContextMenuTabId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500/20 text-rose-300 text-left transition cursor-pointer"
                  >
                    <X className="w-3 h-3 text-rose-400" />
                    <span>Close Tab</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Tab Button Fixed to Right */}
      <div className="pl-1.5 border-l border-[#1A202C] shrink-0">
        <button
          type="button"
          onClick={onNewTab}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#121620] hover:bg-[#1A202C] text-slate-300 hover:text-white border border-[#262D3D] text-xs font-medium transition cursor-pointer shadow-xs"
          title="Create new JSON document (Alt + N)"
          aria-label="Create new JSON document"
        >
          <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="hidden sm:inline">New Tab</span>
        </button>
      </div>
    </div>
  );
};
