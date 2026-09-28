import { analyzeJsonErrors } from './errorAnalyzer';
import { applyDeterministicRepairs } from './repairRules';
import { ConfidenceLevel, RepairCandidate } from './types';

export function evaluateAndRepair(raw: string): RepairCandidate {
  const diagnosticsBefore = analyzeJsonErrors(raw);

  let nativeErrorBefore: string | undefined;
  try {
    JSON.parse(raw);
  } catch (err) {
    nativeErrorBefore = (err as Error).message;
  }

  // If already valid JSON with 0 errors
  if (!nativeErrorBefore && diagnosticsBefore.length === 0) {
    return {
      original: raw,
      repaired: raw,
      isValid: true,
      confidence: 'high',
      confidenceScore: 100,
      changes: [],
      diagnosticsBefore: [],
      diagnosticsAfter: [],
    };
  }

  // Apply deterministic repairs
  const { text: repairedText, changes } = applyDeterministicRepairs(raw);

  let isValid = false;
  let nativeErrorAfter: string | undefined;
  try {
    JSON.parse(repairedText);
    isValid = true;
  } catch (err) {
    nativeErrorAfter = (err as Error).message;
  }

  const diagnosticsAfter = isValid ? [] : analyzeJsonErrors(repairedText);

  // Compute confidence level & score
  let confidence: ConfidenceLevel = 'low';
  let confidenceScore = 0;

  if (isValid) {
    const hasHeuristicChanges = changes.some(
      (c) => c.category === 'UNCLOSED_DELIMITER' || c.category === 'MISSING_COMMA'
    );

    if (hasHeuristicChanges) {
      confidence = 'medium';
      confidenceScore = 88;
    } else {
      confidence = 'high';
      confidenceScore = 100;
    }
  } else {
    confidence = 'low';
    confidenceScore = Math.max(0, 50 - diagnosticsAfter.length * 10);
  }

  return {
    original: raw,
    repaired: repairedText,
    isValid,
    confidence,
    confidenceScore,
    changes,
    diagnosticsBefore,
    diagnosticsAfter,
    nativeErrorBefore,
    nativeErrorAfter,
  };
}
