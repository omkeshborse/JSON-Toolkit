import { evaluateAndRepair } from './jsonEngine/repairValidator';
import { RepairCandidate } from './jsonEngine/types';

export * from './jsonEngine/types';
export * from './jsonEngine/tokenizer';
export * from './jsonEngine/errorCategories';
export * from './jsonEngine/errorAnalyzer';
export * from './jsonEngine/repairRules';
export * from './jsonEngine/repairValidator';

export interface JsonFixResult {
  fixedJson: string;
  repaired: boolean;
  fixesApplied: string[];
  candidate?: RepairCandidate;
  error?: string;
}

export function repairJson(raw: string): JsonFixResult {
  if (!raw || !raw.trim()) {
    return {
      fixedJson: '',
      repaired: false,
      fixesApplied: [],
      error: 'Empty input',
    };
  }

  const candidate = evaluateAndRepair(raw);

  if (candidate.isValid) {
    let formatted = candidate.repaired;
    try {
      formatted = JSON.stringify(JSON.parse(candidate.repaired), null, 2);
    } catch {
      // Keep as repaired
    }

    const descriptions = candidate.changes.map((c) => c.description);
    return {
      fixedJson: formatted,
      repaired: candidate.changes.length > 0,
      fixesApplied: descriptions.length > 0 ? descriptions : ['Already valid JSON - formatted nicely'],
      candidate,
    };
  }

  return {
    fixedJson: candidate.repaired,
    repaired: false,
    fixesApplied: candidate.changes.map((c) => c.description),
    candidate,
    error: candidate.nativeErrorAfter || 'Could not fully auto-repair all syntax errors',
  };
}
