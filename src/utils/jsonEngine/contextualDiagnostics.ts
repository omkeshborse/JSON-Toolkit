import { JsonErrorDiagnostic, ConfidenceLevel, ErrorCategory } from './types';
import { ERROR_CATEGORIES } from './errorCategories';

export interface ContextualSnippet {
  startLine: number;
  lines: {
    lineNum: number;
    text: string;
    isErrorLine: boolean;
  }[];
  pointerColumn?: number;
}

export interface ContextualDiagnosticInfo {
  diagnostic: JsonErrorDiagnostic;
  title: string;
  category: ErrorCategory;
  what: string;
  why: string;
  where: string;
  suggestedFixDesc?: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  canQuickFix: boolean;
  contextSnippet: ContextualSnippet;
}

/**
 * Extracts nearby lines around an error line (e.g. 3 lines before + error line + 3 lines after).
 */
export function extractContextSnippet(
  fullText: string,
  errorLine: number,
  column: number = 1,
  radius: number = 2
): ContextualSnippet {
  const allLines = fullText.split('\n');
  const total = allLines.length;
  const startIdx = Math.max(0, errorLine - 1 - radius);
  const endIdx = Math.min(total - 1, errorLine - 1 + radius);

  const lines = [];
  for (let idx = startIdx; idx <= endIdx; idx++) {
    lines.push({
      lineNum: idx + 1,
      text: allLines[idx],
      isErrorLine: idx + 1 === errorLine,
    });
  }

  return {
    startLine: startIdx + 1,
    lines,
    pointerColumn: column,
  };
}

/**
 * Enriches a raw JsonErrorDiagnostic with contextual human-readable explanation,
 * snippet window, and quick fix eligibility.
 */
export function buildContextualDiagnostic(
  diag: JsonErrorDiagnostic,
  fullText: string,
  globalConfidence: ConfidenceLevel = 'high',
  globalScore: number = 100,
  hasValidCandidate: boolean = false
): ContextualDiagnosticInfo {
  const meta = ERROR_CATEGORIES[diag.code];
  const title = meta?.title || diag.code.replace(/_/g, ' ');

  let what = diag.message;
  let why = meta?.description || 'Syntax violates RFC 8259 JSON standards.';
  let suggestedFixDesc = diag.suggestedFix;

  // Specific explanations based on category
  switch (diag.code) {
    case 'UNQUOTED_KEY':
      what = 'Property key is missing double quotes';
      why = 'Under RFC 8259, JSON keys must be enclosed in double quotes (e.g. "key": value). Bare identifiers are not permitted.';
      suggestedFixDesc = suggestedFixDesc || 'Wrap the property key in double quotes';
      break;
    case 'SINGLE_QUOTES':
      what = 'Single quotes used instead of double quotes';
      why = 'RFC 8259 requires strings and property names to use double quotes ("). Single quotes (\') are invalid.';
      suggestedFixDesc = suggestedFixDesc || 'Replace single quotes with double quotes';
      break;
    case 'TRAILING_COMMA':
      what = 'Disallowed trailing comma';
      why = 'In standard JSON, a comma cannot follow the last element in an array or object.';
      suggestedFixDesc = suggestedFixDesc || 'Remove the trailing comma';
      break;
    case 'MISSING_COMMA':
      what = 'Missing separating comma';
      why = 'Array elements and object key-value pairs must be separated by a comma.';
      suggestedFixDesc = suggestedFixDesc || 'Add a comma between elements';
      break;
    case 'COMMENTS_PRESENT':
      what = 'Comments are not permitted in JSON';
      why = 'Standard JSON does not support comments (// or /* */).';
      suggestedFixDesc = suggestedFixDesc || 'Remove comments';
      break;
    case 'PYTHON_LITERALS':
      what = 'Non-standard boolean or null literal';
      why = 'JSON only allows lowercase "true", "false", and "null". Capitalized variants (e.g. True, None) are not permitted.';
      suggestedFixDesc = suggestedFixDesc || 'Convert to standard lowercase literal';
      break;
    case 'UNCLOSED_DELIMITER':
      what = 'Unclosed bracket or brace';
      why = 'An open object "{" or array "[" was not balanced by a matching closing bracket.';
      suggestedFixDesc = suggestedFixDesc || 'Add matching closing bracket';
      break;
    case 'DUPLICATE_KEY':
      what = 'Duplicate property key detected';
      why = 'Although some parsers accept duplicate keys, RFC 8259 strongly advises unique keys to prevent value shadowing.';
      suggestedFixDesc = undefined;
      break;
  }

  // Quick fix is available if high confidence and a valid repair candidate exists
  const canQuickFix =
    hasValidCandidate &&
    globalConfidence === 'high' &&
    diag.severity === 'error' &&
    diag.code !== 'DUPLICATE_KEY';

  const contextSnippet = extractContextSnippet(fullText, diag.line, diag.column);

  return {
    diagnostic: diag,
    title,
    category: diag.code,
    what,
    why,
    where: `Line ${diag.line}, Column ${diag.column}`,
    suggestedFixDesc,
    confidence: globalConfidence,
    confidenceScore: globalScore,
    canQuickFix,
    contextSnippet,
  };
}
