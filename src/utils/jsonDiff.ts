// Deep JSON comparison utility for JSON Toolkit

export type DiffType = 'added' | 'removed' | 'changed' | 'identical';

export interface DiffEntry {
  path: string;
  type: DiffType;
  oldValue?: any;
  newValue?: any;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  identical: number;
  totalDiffs: number;
  isIdentical: boolean;
}

export interface DiffResult {
  entries: DiffEntry[];
  summary: DiffSummary;
}

export function compareJson(objA: any, objB: any): DiffResult {
  const entries: DiffEntry[] = [];

  function deepCompare(a: any, b: any, currentPath: string) {
    // Both are identical primitive or same reference
    if (a === b) {
      entries.push({
        path: currentPath || 'root',
        type: 'identical',
        oldValue: a,
        newValue: b,
      });
      return;
    }

    // Type difference or one is null/primitive while other is object
    const typeA = typeof a;
    const typeB = typeof b;

    if (
      typeA !== typeB ||
      a === null ||
      b === null ||
      typeA !== 'object' ||
      typeB !== 'object' ||
      Array.isArray(a) !== Array.isArray(b)
    ) {
      entries.push({
        path: currentPath || 'root',
        type: 'changed',
        oldValue: a,
        newValue: b,
      });
      return;
    }

    // Both are Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLen = Math.max(a.length, b.length);
      for (let i = 0; i < maxLen; i++) {
        const itemPath = `${currentPath}[${i}]`;
        if (i >= a.length) {
          entries.push({
            path: itemPath,
            type: 'added',
            newValue: b[i],
          });
        } else if (i >= b.length) {
          entries.push({
            path: itemPath,
            type: 'removed',
            oldValue: a[i],
          });
        } else {
          deepCompare(a[i], b[i], itemPath);
        }
      }
      return;
    }

    // Both are Objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    const allKeys = Array.from(new Set([...keysA, ...keysB])).sort();

    for (const key of allKeys) {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      const inA = key in a;
      const inB = key in b;

      if (!inA && inB) {
        entries.push({
          path: keyPath,
          type: 'added',
          newValue: b[key],
        });
      } else if (inA && !inB) {
        entries.push({
          path: keyPath,
          type: 'removed',
          oldValue: a[key],
        });
      } else {
        deepCompare(a[key], b[key], keyPath);
      }
    }
  }

  deepCompare(objA, objB, '');

  let added = 0;
  let removed = 0;
  let changed = 0;
  let identical = 0;

  for (const entry of entries) {
    if (entry.type === 'added') added++;
    else if (entry.type === 'removed') removed++;
    else if (entry.type === 'changed') changed++;
    else if (entry.type === 'identical') identical++;
  }

  const totalDiffs = added + removed + changed;

  return {
    entries,
    summary: {
      added,
      removed,
      changed,
      identical,
      totalDiffs,
      isIdentical: totalDiffs === 0,
    },
  };
}
