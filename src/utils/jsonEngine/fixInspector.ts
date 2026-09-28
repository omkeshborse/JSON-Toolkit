import { ConfidenceLevel, ErrorCategory, FixChangeDetail } from './types';
import { applyDeterministicRepairs } from './repairRules';

export interface ProposedFixItem {
  id: string;
  category: ErrorCategory;
  description: string;
  confidence: ConfidenceLevel;
  line?: number;
  column?: number;
  beforeSnippet?: string;
  afterSnippet?: string;
  count: number;
  accepted: boolean;
  dependsOn?: string[];
}

export interface FixInspectorEvaluation {
  fixes: ProposedFixItem[];
  repairedText: string;
  isValid: boolean;
  parseError: string | null;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  activeFixCount: number;
}

/**
 * Builds discrete ProposedFixItems from candidate changes and diagnostics.
 */
export function buildProposedFixItems(raw: string): ProposedFixItem[] {
  const { changes } = applyDeterministicRepairs(raw);
  if (changes.length === 0) return [];

  const items: ProposedFixItem[] = [];

  // Map each change category to a distinct selectable fix item
  for (let idx = 0; idx < changes.length; idx++) {
    const ch = changes[idx];
    let confidence: ConfidenceLevel = 'high';
    if (ch.category === 'UNCLOSED_DELIMITER' || ch.category === 'MISSING_COMMA') {
      confidence = 'medium';
    }

    // Inspect snippet hints
    let beforeSnippet: string | undefined;
    let afterSnippet: string | undefined;

    if (ch.category === 'UNQUOTED_KEY') {
      const match = raw.match(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/);
      if (match) {
        beforeSnippet = `${match[2]}:`;
        afterSnippet = `"${match[2]}":`;
      }
    } else if (ch.category === 'SINGLE_QUOTES') {
      const match = raw.match(/'([^'\\]*(?:\\.[^'\\]*)*)'/);
      if (match) {
        beforeSnippet = match[0];
        afterSnippet = `"${match[1].replace(/"/g, '\\"')}"`;
      }
    } else if (ch.category === 'TRAILING_COMMA') {
      const match = raw.match(/,\s*([}\]])/);
      if (match) {
        beforeSnippet = match[0];
        afterSnippet = match[1];
      }
    } else if (ch.category === 'COMMENTS_PRESENT') {
      const match = raw.match(/\/\/[^\n\r]*|\/\*[\s\S]*?\*\//);
      if (match) {
        beforeSnippet = match[0];
        afterSnippet = '(removed)';
      }
    } else if (ch.category === 'PYTHON_LITERALS') {
      const match = raw.match(/\b(True|TRUE|False|FALSE|None|NULL)\b/);
      if (match) {
        beforeSnippet = match[0];
        const val = match[0];
        afterSnippet = val.toLowerCase() === 'none' || val === 'NULL' ? 'null' : val.toLowerCase();
      }
    }

    items.push({
      id: `fix-${ch.category.toLowerCase()}-${idx}`,
      category: ch.category,
      description: ch.description,
      confidence,
      count: ch.count,
      beforeSnippet,
      afterSnippet,
      accepted: true, // Default to accepted
      dependsOn: ch.category === 'MISSING_COMMA' ? ['SINGLE_QUOTES', 'UNQUOTED_KEY'] : undefined,
    });
  }

  return items;
}

/**
 * Selectively applies ONLY accepted fixes to the raw string.
 * Then validates the outcome against strict JSON.parse.
 */
export function evaluateSelectiveFixes(raw: string, fixes: ProposedFixItem[]): FixInspectorEvaluation {
  const activeCategories = new Set(
    fixes.filter((f) => f.accepted).map((f) => f.category)
  );

  let s = raw;
  const appliedChanges: FixChangeDetail[] = [];

  // 1. Comments
  if (activeCategories.has('COMMENTS_PRESENT')) {
    let commentsRemoved = 0;
    const commentRegex = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(\/\/[^\n\r]*)|(\/\*[\s\S]*?\*\/)/g;
    s = s.replace(commentRegex, (match, dStr, sStr, lineComm, blockComm) => {
      if (dStr) return dStr;
      if (sStr) return sStr;
      if (lineComm || blockComm) {
        commentsRemoved++;
        return '';
      }
      return match;
    });
    if (commentsRemoved > 0) {
      appliedChanges.push({
        category: 'COMMENTS_PRESENT',
        description: `Removed ${commentsRemoved} comment(s)`,
        count: commentsRemoved,
      });
    }
  }

  // 2. Python Literals
  if (activeCategories.has('PYTHON_LITERALS')) {
    let pythonFixes = 0;
    const pythonRegex = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|\b(True|TRUE|False|FALSE|None|NULL)\b/g;
    s = s.replace(pythonRegex, (match, dStr, sStr, pyLit) => {
      if (dStr) return dStr;
      if (sStr) return sStr;
      if (pyLit) {
        pythonFixes++;
        if (pyLit === 'True' || pyLit === 'TRUE') return 'true';
        if (pyLit === 'False' || pyLit === 'FALSE') return 'false';
        if (pyLit === 'None' || pyLit === 'NULL') return 'null';
      }
      return match;
    });
    if (pythonFixes > 0) {
      appliedChanges.push({
        category: 'PYTHON_LITERALS',
        description: `Converted ${pythonFixes} literal(s)`,
        count: pythonFixes,
      });
    }
  }

  // 3. Single quotes
  if (activeCategories.has('SINGLE_QUOTES')) {
    let singleQuoteFixes = 0;
    const sqRegex = /("(?:\\.|[^"\\])*")|'((?:\\.|[^'\\])*)'/g;
    s = s.replace(sqRegex, (match, dStr, sqContent) => {
      if (dStr) return dStr;
      if (sqContent !== undefined) {
        singleQuoteFixes++;
        const escaped = sqContent.replace(/\\'/g, "'").replace(/"/g, '\\"');
        return `"${escaped}"`;
      }
      return match;
    });
    if (singleQuoteFixes > 0) {
      appliedChanges.push({
        category: 'SINGLE_QUOTES',
        description: `Replaced ${singleQuoteFixes} single-quoted string(s)`,
        count: singleQuoteFixes,
      });
    }
  }

  // 4. Unquoted keys
  if (activeCategories.has('UNQUOTED_KEY')) {
    let unquotedKeyFixes = 0;
    const unquotedRegex = /("(?:\\.|[^"\\])*")|([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g;
    s = s.replace(unquotedRegex, (match, dStr, prefix, key) => {
      if (dStr) return dStr;
      if (prefix && key) {
        unquotedKeyFixes++;
        return `${prefix}"${key}":`;
      }
      return match;
    });
    if (unquotedKeyFixes > 0) {
      appliedChanges.push({
        category: 'UNQUOTED_KEY',
        description: `Quoted ${unquotedKeyFixes} unquoted key(s)`,
        count: unquotedKeyFixes,
      });
    }
  }

  // 5. Trailing commas
  if (activeCategories.has('TRAILING_COMMA')) {
    let trailingCommaFixes = 0;
    const trailingCommaRegex = /("(?:\\.|[^"\\])*")|(,)(\s*[}\]])/g;
    s = s.replace(trailingCommaRegex, (match, dStr, comma, closing) => {
      if (dStr) return dStr;
      if (comma && closing) {
        trailingCommaFixes++;
        return closing;
      }
      return match;
    });
    if (trailingCommaFixes > 0) {
      appliedChanges.push({
        category: 'TRAILING_COMMA',
        description: `Stripped ${trailingCommaFixes} trailing comma(s)`,
        count: trailingCommaFixes,
      });
    }
  }

  // 6. Missing commas
  if (activeCategories.has('MISSING_COMMA')) {
    let missingCommaFixes = 0;
    const missingCommaRegex = /("(?:\\.|[^"\\])*"|[0-9]+|true|false|null|[}\]])\s*(\n\s*)("(?:\\.|[^"\\])*"|[0-9]+|true|false|null|[{[])/g;
    const commaFixed = s.replace(missingCommaRegex, (match, val1, whitespace, val2) => {
      missingCommaFixes++;
      return `${val1},${whitespace}${val2}`;
    });
    try {
      JSON.parse(commaFixed);
      if (missingCommaFixes > 0) {
        s = commaFixed;
        appliedChanges.push({
          category: 'MISSING_COMMA',
          description: `Inserted ${missingCommaFixes} missing comma(s)`,
          count: missingCommaFixes,
        });
      }
    } catch {
      // Keep without missing comma if fails
    }
  }

  // 7. Unclosed Delimiters
  if (activeCategories.has('UNCLOSED_DELIMITER')) {
    const openStack: string[] = [];
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (inString) {
        if (isEscaped) {
          isEscaped = false;
        } else if (ch === '\\') {
          isEscaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === '{') {
        openStack.push('}');
      } else if (ch === '[') {
        openStack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (openStack.length > 0 && openStack[openStack.length - 1] === ch) {
          openStack.pop();
        }
      }
    }

    if (inString) {
      s += '"';
    }
    if (openStack.length > 0) {
      const missingClosing = openStack.reverse().join('');
      s = s.trimEnd() + missingClosing;
    }
  }

  // Validate resulting JSON strictly
  let isValid = false;
  let parseError: string | null = null;
  try {
    JSON.parse(s);
    isValid = true;
  } catch (err: any) {
    parseError = err.message || 'JSON.parse syntax failure';
  }

  let confidence: ConfidenceLevel = 'low';
  let confidenceScore = 0;

  if (isValid) {
    const hasHeuristic = appliedChanges.some(
      (c) => c.category === 'UNCLOSED_DELIMITER' || c.category === 'MISSING_COMMA'
    );
    confidence = hasHeuristic ? 'medium' : 'high';
    confidenceScore = hasHeuristic ? 88 : 100;
  } else {
    confidence = 'low';
    confidenceScore = 30;
  }

  return {
    fixes,
    repairedText: s,
    isValid,
    parseError,
    confidence,
    confidenceScore,
    activeFixCount: appliedChanges.length,
  };
}
