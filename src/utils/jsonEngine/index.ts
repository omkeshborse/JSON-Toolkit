import { analyzeJsonErrors } from './errorAnalyzer';
import { evaluateAndRepair } from './repairValidator';
import { buildProposedFixItems, evaluateSelectiveFixes, ProposedFixItem, FixInspectorEvaluation } from './fixInspector';
import { buildContextualDiagnostic, ContextualDiagnosticInfo } from './contextualDiagnostics';
import { JsonErrorDiagnostic, RepairCandidate, ConfidenceLevel } from './types';

export interface JsonEngineValidationResult {
  isValid: boolean;
  data: any | null;
  error: string | null;
  line: number | null;
  column: number | null;
  diagnostics: JsonErrorDiagnostic[];
  contextualDiagnostics: ContextualDiagnosticInfo[];
  candidate: RepairCandidate | null;
}

export interface JsonEngineFormatOptions {
  indent?: number | string;
}

/**
 * Unified JSON Engine Facade.
 * Single source of truth for parsing, validation, error diagnostics,
 * formatting, minification, and deterministic repairs across the application.
 */
export const JsonEngine = {
  /**
   * Strictly validates JSON input, returning parsed data or structured diagnostics and repair candidates.
   */
  validate(raw: string): JsonEngineValidationResult {
    const trimmed = raw.trim();
    if (!trimmed) {
      return {
        isValid: false,
        data: null,
        error: null,
        line: null,
        column: null,
        diagnostics: [],
        contextualDiagnostics: [],
        candidate: null,
      };
    }

    try {
      const data = JSON.parse(trimmed);
      return {
        isValid: true,
        data,
        error: null,
        line: null,
        column: null,
        diagnostics: [],
        contextualDiagnostics: [],
        candidate: null,
      };
    } catch (err: any) {
      const diagnostics = analyzeJsonErrors(raw);
      const candidate = evaluateAndRepair(raw);
      const firstDiag = diagnostics[0];

      const contextualDiagnostics = diagnostics.map((d) =>
        buildContextualDiagnostic(
          d,
          raw,
          candidate?.confidence || 'high',
          candidate?.confidenceScore || 0,
          Boolean(candidate && candidate.isValid && candidate.confidence !== 'low')
        )
      );

      return {
        isValid: false,
        data: null,
        error: err?.message || 'Invalid JSON syntax',
        line: firstDiag ? firstDiag.line : null,
        column: firstDiag ? firstDiag.column : null,
        diagnostics,
        contextualDiagnostics,
        candidate,
      };
    }
  },

  /**
   * Pretty-prints valid JSON with specified indentation.
   * Throws if input is invalid; does NOT silently repair.
   */
  format(raw: string, options: JsonEngineFormatOptions = {}): string {
    const indent = options.indent !== undefined ? options.indent : 2;
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, indent);
  },

  /**
   * Minifies valid JSON into a compact representation without whitespace.
   * Throws if input is invalid; does NOT silently repair.
   */
  minify(raw: string): string {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed);
  },

  /**
   * Analyzes syntax errors without mutating input.
   */
  diagnose(raw: string): JsonErrorDiagnostic[] {
    return analyzeJsonErrors(raw);
  },

  /**
   * Computes deterministic repair candidate.
   */
  getRepairCandidate(raw: string): RepairCandidate | null {
    if (!raw.trim()) return null;
    return evaluateAndRepair(raw);
  },

  /**
   * Builds discrete selectable proposed fix items for the Fix Inspector.
   */
  getProposedFixes(raw: string): ProposedFixItem[] {
    return buildProposedFixItems(raw);
  },

  /**
   * Evaluates selective fix applications against strict JSON.parse.
   */
  evaluateSelectiveFixes(raw: string, fixes: ProposedFixItem[]): FixInspectorEvaluation {
    return evaluateSelectiveFixes(raw, fixes);
  },
};

export * from './types';
export * from './errorCategories';
export * from './errorAnalyzer';
export * from './repairRules';
export * from './repairValidator';
export * from './fixInspector';
export * from './contextualDiagnostics';
