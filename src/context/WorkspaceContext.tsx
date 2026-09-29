import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  JsonWorkspaceTab,
  createInitialTab,
  loadWorkspaceFromStorage,
  saveWorkspaceToStorage,
} from '../types/workspace';
import { SAMPLE_DATASETS } from '../data/samples';

interface WorkspaceContextType {
  tabs: JsonWorkspaceTab[];
  activeTabId: string;
  activeTab: JsonWorkspaceTab;
  selectTab: (id: string) => void;
  newTab: (title?: string, initialContent?: string) => string;
  closeTab: (id: string) => void;
  renameTab: (id: string, newTitle: string) => void;
  duplicateTab: (id: string) => string;
  updateActiveTab: (
    updater: Partial<JsonWorkspaceTab> | ((prev: JsonWorkspaceTab) => Partial<JsonWorkspaceTab>)
  ) => void;
  updateTabById: (
    id: string,
    updater: Partial<JsonWorkspaceTab> | ((prev: JsonWorkspaceTab) => Partial<JsonWorkspaceTab>)
  ) => void;
  workspaceMode: 'normal' | 'expanded' | 'fullscreen';
  setWorkspaceMode: React.Dispatch<React.SetStateAction<'normal' | 'expanded' | 'fullscreen'>>;
  toggleExpand: () => void;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Global Workspace UI state (normal | expanded | fullscreen)
  const [workspaceMode, setWorkspaceMode] = useState<'normal' | 'expanded' | 'fullscreen'>('normal');

  // Debounced persistence to localStorage (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveWorkspaceToStorage(tabs, activeTabId);
    }, 400);
    return () => clearTimeout(timer);
  }, [tabs, activeTabId]);

  // Derived Active Tab with fallback
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0] || createInitialTab();
  }, [tabs, activeTabId]);

  // Tab Operations
  const selectTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const newTab = useCallback((title?: string, initialContent: string = '') => {
    let createdId = '';
    setTabs((prev) => {
      const count = prev.length + 1;
      const tabTitle = title || `Untitled JSON ${count > 1 ? count : ''}`.trim();
      const tab = createInitialTab(tabTitle, initialContent);
      createdId = tab.id;
      setActiveTabId(tab.id);
      return [...prev, tab];
    });
    return createdId;
  }, []);

  const closeTab = useCallback((targetTabId: string) => {
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

      // If closing active tab, switch to adjacent tab
      if (targetTabId === activeTabId) {
        const nextActive = remaining[Math.min(idx, remaining.length - 1)];
        setActiveTabId(nextActive.id);
      }

      return remaining;
    });
  }, [activeTabId]);

  const renameTab = useCallback((id: string, newTitle: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle, updatedAt: Date.now() } : t))
    );
  }, []);

  const duplicateTab = useCallback((id: string) => {
    let newId = '';
    setTabs((prev) => {
      const source = prev.find((t) => t.id === id);
      if (!source) return prev;
      const now = Date.now();
      const copyTab: JsonWorkspaceTab = {
        ...source,
        id: `tab-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: `${source.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };
      newId = copyTab.id;
      setActiveTabId(copyTab.id);
      return [...prev, copyTab];
    });
    return newId;
  }, []);

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

  const updateTabById = useCallback(
    (
      id: string,
      updater: Partial<JsonWorkspaceTab> | ((prev: JsonWorkspaceTab) => Partial<JsonWorkspaceTab>)
    ) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id !== id) return tab;
          const patch = typeof updater === 'function' ? updater(tab) : updater;
          return {
            ...tab,
            ...patch,
            updatedAt: Date.now(),
          };
        })
      );
    },
    []
  );

  // Expand / Fullscreen Actions
  const toggleExpand = useCallback(() => {
    setWorkspaceMode((prev) => (prev === 'expanded' ? 'normal' : 'expanded'));
  }, []);

  const toggleFullscreen = useCallback(() => {
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
  }, []);

  const exitFullscreen = useCallback(() => {
    setWorkspaceMode('normal');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to Escape key & fullscreenchange
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (workspaceMode === 'fullscreen') {
          exitFullscreen();
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
  }, [workspaceMode, exitFullscreen]);

  // Lock body scroll only in fullscreen mode
  useEffect(() => {
    if (workspaceMode === 'fullscreen') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [workspaceMode]);

  const value = useMemo(
    () => ({
      tabs,
      activeTabId,
      activeTab,
      selectTab,
      newTab,
      closeTab,
      renameTab,
      duplicateTab,
      updateActiveTab,
      updateTabById,
      workspaceMode,
      setWorkspaceMode,
      toggleExpand,
      toggleFullscreen,
      exitFullscreen,
    }),
    [
      tabs,
      activeTabId,
      activeTab,
      selectTab,
      newTab,
      closeTab,
      renameTab,
      duplicateTab,
      updateActiveTab,
      updateTabById,
      workspaceMode,
      toggleExpand,
      toggleFullscreen,
      exitFullscreen,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
