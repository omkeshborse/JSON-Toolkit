export interface JsonWorkspaceTab {
  id: string;
  title: string;
  inputJson: string;
  outputJson: string;
  indentation: number | 'tab';
  undoInput: string | null;
  isDirty: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceStorageData {
  workspaceVersion: number;
  tabs: JsonWorkspaceTab[];
  activeTabId: string;
}

export const WORKSPACE_STORAGE_KEY = '101_json_toolkit_tabs_v1';
export const CURRENT_WORKSPACE_VERSION = 1;

export function createInitialTab(title: string = 'Untitled JSON', initialInput: string = ''): JsonWorkspaceTab {
  const now = Date.now();
  return {
    id: `tab-${now}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    inputJson: initialInput,
    outputJson: initialInput ? initialInput : '',
    indentation: 2,
    undoInput: null,
    isDirty: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadWorkspaceFromStorage(): { tabs: JsonWorkspaceTab[]; activeTabId: string } | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const data: WorkspaceStorageData = JSON.parse(raw);
    if (!data || data.workspaceVersion !== CURRENT_WORKSPACE_VERSION || !Array.isArray(data.tabs) || data.tabs.length === 0) {
      return null;
    }

    // Sanitize tabs
    const validTabs: JsonWorkspaceTab[] = data.tabs.map((t, idx) => ({
      id: typeof t.id === 'string' ? t.id : `tab-${Date.now()}-${idx}`,
      title: typeof t.title === 'string' && t.title.trim() ? t.title : `Untitled JSON ${idx > 0 ? idx + 1 : ''}`.trim(),
      inputJson: typeof t.inputJson === 'string' ? t.inputJson : '',
      outputJson: typeof t.outputJson === 'string' ? t.outputJson : '',
      indentation: t.indentation === 'tab' || [2, 3, 4].includes(Number(t.indentation)) ? t.indentation : 2,
      undoInput: typeof t.undoInput === 'string' ? t.undoInput : null,
      isDirty: Boolean(t.isDirty),
      createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
      updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
    }));

    if (validTabs.length === 0) return null;

    const activeTabId = validTabs.some((t) => t.id === data.activeTabId)
      ? data.activeTabId
      : validTabs[0].id;

    return { tabs: validTabs, activeTabId };
  } catch (e) {
    console.warn('Could not load workspace from localStorage. Initializing fresh workspace.', e);
    return null;
  }
}

export function saveWorkspaceToStorage(tabs: JsonWorkspaceTab[], activeTabId: string): void {
  try {
    // Only persist if size is sensible to avoid hitting 5MB quota with massive payloads
    const payload: WorkspaceStorageData = {
      workspaceVersion: CURRENT_WORKSPACE_VERSION,
      tabs: tabs.map((t) => ({
        ...t,
        // If a single tab input exceeds 1.5MB, preserve in memory without breaking localStorage
        inputJson: t.inputJson.length > 1_500_000 ? '' : t.inputJson,
        outputJson: t.outputJson.length > 1_500_000 ? '' : t.outputJson,
      })),
      activeTabId,
    };
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save tabs to localStorage (quota or disabled).', e);
  }
}
