import { tokenize } from './tokenizer';
import { JsonErrorDiagnostic, Token, TokenType } from './types';

interface ScopeFrame {
  type: 'object' | 'array';
  token: Token;
  keys: Set<string>;
  expectingKey?: boolean;
  expectingColon?: boolean;
  expectingValue?: boolean;
  hasFinishedEntry?: boolean;
}

export function analyzeJsonErrors(input: string): JsonErrorDiagnostic[] {
  const diagnostics: JsonErrorDiagnostic[] = [];
  const trimmed = input.trim();

  if (!trimmed) {
    return [
      {
        id: 'err-empty',
        code: 'EMPTY_INPUT',
        message: 'JSON input is empty. Please provide a valid JSON object or array.',
        severity: 'warning',
        line: 1,
        column: 1,
        offset: 0,
        length: 0,
      },
    ];
  }

  // Check special formats: HTML / XML
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
    const firstLine = trimmed.split('\n')[0];
    diagnostics.push({
      id: 'err-html-format',
      code: 'HTML_INPUT',
      message: 'Input appears to be HTML or XML document markup, not JSON.',
      severity: 'error',
      line: 1,
      column: 1,
      offset: 0,
      length: firstLine.length,
    });
    return diagnostics;
  }

  // Check special formats: NDJSON (Newline Delimited JSON)
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    let allLinesAreJson = true;
    for (const l of lines) {
      try {
        JSON.parse(l);
      } catch {
        allLinesAreJson = false;
        break;
      }
    }
    if (allLinesAreJson) {
      diagnostics.push({
        id: 'warn-ndjson-format',
        code: 'NDJSON_FORMAT',
        message: 'Detected Line-Delimited JSON (NDJSON / JSON Lines). In standard JSON, multiple root items must be enclosed in an array [...].',
        severity: 'error',
        line: 2,
        column: 1,
        offset: 0,
        length: lines[1].length,
      });
      return diagnostics;
    }
  }

  // Verify native JSON.parse
  let nativeError: SyntaxError | null = null;
  try {
    JSON.parse(input);
  } catch (err) {
    nativeError = err as SyntaxError;
  }

  const allTokens = tokenize(input);
  const nonWsTokens = allTokens.filter((t) => t.type !== 'Whitespace');

  // Track scopes and duplicate keys
  const stack: ScopeFrame[] = [];

  for (let i = 0; i < nonWsTokens.length; i++) {
    const t = nonWsTokens[i];
    const next = nonWsTokens[i + 1];
    const prev = i > 0 ? nonWsTokens[i - 1] : null;

    // 1. Direct token-level rule checks
    // Single quotes detection
    if (t.type === 'SingleQuoteString') {
      diagnostics.push({
        id: `err-sq-${t.start.offset}`,
        code: 'SINGLE_QUOTES',
        message: `Single quotes used around string ${truncateStr(t.value)}. JSON requires double quotes (").`,
        severity: 'error',
        line: t.start.line,
        column: t.start.column,
        offset: t.start.offset,
        length: t.value.length,
        snippet: t.value,
        suggestedFix: `Replace single quotes with double quotes`,
      });
    }

    // Comments detection
    if (t.type === 'Comment') {
      diagnostics.push({
        id: `err-comment-${t.start.offset}`,
        code: 'COMMENTS_PRESENT',
        message: `Comments are not allowed in standard JSON.`,
        severity: 'error',
        line: t.start.line,
        column: t.start.column,
        offset: t.start.offset,
        length: t.value.length,
        snippet: t.value,
        suggestedFix: 'Remove comment',
      });
      continue;
    }

    // Python / non-standard literals detection
    if (t.type === 'PythonLiteral') {
      let replacement = 'null';
      if (t.value === 'True' || t.value === 'TRUE') replacement = 'true';
      if (t.value === 'False' || t.value === 'FALSE') replacement = 'false';
      diagnostics.push({
        id: `err-python-${t.start.offset}`,
        code: 'PYTHON_LITERALS',
        message: `Non-standard literal '${t.value}' is not valid JSON. Use '${replacement}'.`,
        severity: 'error',
        line: t.start.line,
        column: t.start.column,
        offset: t.start.offset,
        length: t.value.length,
        snippet: t.value,
        suggestedFix: `Change '${t.value}' to '${replacement}'`,
      });
    }

    // Trailing comma detection
    if (t.type === 'Comma' && next && (next.type === 'CloseBrace' || next.type === 'CloseBracket')) {
      diagnostics.push({
        id: `err-trailing-${t.start.offset}`,
        code: 'TRAILING_COMMA',
        message: `Trailing comma before '${next.value}' is not allowed in JSON.`,
        severity: 'error',
        line: t.start.line,
        column: t.start.column,
        offset: t.start.offset,
        length: 1,
        snippet: `,${next.value}`,
        suggestedFix: 'Remove trailing comma',
      });
    }

    // Unquoted keys (identifier followed by colon)
    if (t.type === 'Identifier' && next && next.type === 'Colon') {
      diagnostics.push({
        id: `err-unquoted-${t.start.offset}`,
        code: 'UNQUOTED_KEY',
        message: `Key '${t.value}' is unquoted. JSON requires all object keys to be double-quoted.`,
        severity: 'error',
        line: t.start.line,
        column: t.start.column,
        offset: t.start.offset,
        length: t.value.length,
        snippet: `${t.value}:`,
        suggestedFix: `Wrap key in double quotes: "${t.value}"`,
      });
    }

    // Unknown tokens
    if (t.type === 'Unknown') {
      diagnostics.push({
        id: `err-unknown-${t.start.offset}`,
        code: 'UNEXPECTED_TOKEN',
        message: `Unexpected character '${t.value}'.`,
        severity: 'error',
        line: t.start.line,
        column: t.start.column,
        offset: t.start.offset,
        length: t.value.length,
      });
    }

    // 2. Structural Stack Tracking & Duplicate Key Detection
    const currentScope = stack.length > 0 ? stack[stack.length - 1] : null;

    if (t.type === 'OpenBrace') {
      stack.push({ type: 'object', token: t, keys: new Set<string>() });
    } else if (t.type === 'OpenBracket') {
      stack.push({ type: 'array', token: t, keys: new Set<string>() });
    } else if (t.type === 'CloseBrace') {
      const top = stack.pop();
      if (!top) {
        diagnostics.push({
          id: `err-unmatched-cb-${t.start.offset}`,
          code: 'MISMATCHED_BRACKETS',
          message: `Unexpected closing brace '}' without a matching opening '{'.`,
          severity: 'error',
          line: t.start.line,
          column: t.start.column,
          offset: t.start.offset,
          length: 1,
        });
      } else if (top.type !== 'object') {
        diagnostics.push({
          id: `err-mismatch-cb-${t.start.offset}`,
          code: 'MISMATCHED_BRACKETS',
          message: `Mismatched brackets: expected ']' to close array opened at line ${top.token.start.line}, but found '}'.`,
          severity: 'error',
          line: t.start.line,
          column: t.start.column,
          offset: t.start.offset,
          length: 1,
        });
      }
    } else if (t.type === 'CloseBracket') {
      const top = stack.pop();
      if (!top) {
        diagnostics.push({
          id: `err-unmatched-sq-${t.start.offset}`,
          code: 'MISMATCHED_BRACKETS',
          message: `Unexpected closing bracket ']' without a matching opening '['.`,
          severity: 'error',
          line: t.start.line,
          column: t.start.column,
          offset: t.start.offset,
          length: 1,
        });
      } else if (top.type !== 'array') {
        diagnostics.push({
          id: `err-mismatch-sq-${t.start.offset}`,
          code: 'MISMATCHED_BRACKETS',
          message: `Mismatched brackets: expected '}' to close object opened at line ${top.token.start.line}, but found ']'.`,
          severity: 'error',
          line: t.start.line,
          column: t.start.column,
          offset: t.start.offset,
          length: 1,
        });
      }
    }

    // Duplicate key detection in objects
    if (
      currentScope &&
      currentScope.type === 'object' &&
      (t.type === 'String' || t.type === 'SingleQuoteString' || t.type === 'Identifier') &&
      next &&
      next.type === 'Colon'
    ) {
      const cleanKey = t.value.replace(/^['"]|['"]$/g, '');
      if (currentScope.keys.has(cleanKey)) {
        diagnostics.push({
          id: `warn-dup-${t.start.offset}`,
          code: 'DUPLICATE_KEY',
          message: `Duplicate key '${cleanKey}' detected in object. In standard JSON, property keys should be unique to avoid ambiguity.`,
          severity: 'warning',
          line: t.start.line,
          column: t.start.column,
          offset: t.start.offset,
          length: t.value.length,
          snippet: `${t.value}:`,
        });
      } else {
        currentScope.keys.add(cleanKey);
      }
    }

    // 3. Accurate Missing Comma Detection
    // In an object: between a completed property value and a subsequent property key
    // In an array: between a completed array element and a subsequent array element
    if (
      prev &&
      t.type !== 'CloseBrace' &&
      t.type !== 'CloseBracket' &&
      t.type !== 'Comma' &&
      t.type !== 'Colon' &&
      t.type !== 'EOF'
    ) {
      const isPrevValueOrCloser =
        isPrimitiveValue(prev.type) || prev.type === 'CloseBrace' || prev.type === 'CloseBracket';

      if (currentScope?.type === 'object') {
        // An object property starts with a key (String, SingleQuoteString, Identifier) followed by a colon
        const isNextPropertyKey =
          (t.type === 'String' || t.type === 'SingleQuoteString' || t.type === 'Identifier') &&
          next &&
          next.type === 'Colon';

        if (isPrevValueOrCloser && isNextPropertyKey) {
          diagnostics.push({
            id: `err-missing-comma-${t.start.offset}`,
            code: 'MISSING_COMMA',
            message: `Missing comma between consecutive object properties.`,
            severity: 'error',
            line: t.start.line,
            column: t.start.column,
            offset: t.start.offset,
            length: 1,
            suggestedFix: 'Insert comma (,)',
          });
        }
      } else if (currentScope?.type === 'array') {
        // In array, subsequent element is a primitive value or OpenBrace or OpenBracket
        const isNextElement =
          isPrimitiveValue(t.type) || t.type === 'OpenBrace' || t.type === 'OpenBracket';

        if (isPrevValueOrCloser && isNextElement) {
          diagnostics.push({
            id: `err-missing-comma-${t.start.offset}`,
            code: 'MISSING_COMMA',
            message: `Missing comma between consecutive array elements.`,
            severity: 'error',
            line: t.start.line,
            column: t.start.column,
            offset: t.start.offset,
            length: 1,
            suggestedFix: 'Insert comma (,)',
          });
        }
      }
    }
  }

  // Any unclosed scopes left in the stack?
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    const expected = unclosed.type === 'object' ? '}' : ']';
    diagnostics.push({
      id: `err-unclosed-${unclosed.token.start.offset}`,
      code: 'UNCLOSED_DELIMITER',
      message: `Unclosed ${unclosed.type}: missing closing '${expected}' for opening at line ${unclosed.token.start.line}.`,
      severity: 'error',
      line: unclosed.token.start.line,
      column: unclosed.token.start.column,
      offset: unclosed.token.start.offset,
      length: 1,
      suggestedFix: `Add closing '${expected}' at end of document`,
    });
  }

  // If native JSON.parse succeeded and there are no warnings, return clean
  if (!nativeError && diagnostics.length === 0) {
    return [];
  }

  // If no diagnostics were identified by scanner rules, fallback to native error
  if (diagnostics.length === 0 && nativeError) {
    const parsedLineCol = extractLineColFromError(nativeError.message, input);
    diagnostics.push({
      id: 'err-native-fallback',
      code: 'OTHER_SYNTAX_ERROR',
      message: nativeError.message,
      severity: 'error',
      line: parsedLineCol.line,
      column: parsedLineCol.column,
      offset: parsedLineCol.offset,
      length: 1,
    });
  }

  // Deduplicate diagnostics by line and column
  const seen = new Set<string>();
  return diagnostics.filter((d) => {
    const key = `${d.code}:${d.line}:${d.column}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isPrimitiveValue(type: TokenType): boolean {
  return (
    type === 'String' ||
    type === 'SingleQuoteString' ||
    type === 'Number' ||
    type === 'Boolean' ||
    type === 'Null' ||
    type === 'PythonLiteral'
  );
}

function truncateStr(s: string, max = 25): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '...';
}

function extractLineColFromError(msg: string, text: string): { line: number; column: number; offset: number } {
  const match = msg.match(/line (\d+) column (\d+)/i) || msg.match(/position (\d+)/i);
  if (match) {
    if (match[2]) {
      const line = parseInt(match[1], 10);
      const col = parseInt(match[2], 10);
      return { line, column: col, offset: 0 };
    }
    if (match[1]) {
      const pos = parseInt(match[1], 10);
      const lines = text.slice(0, pos).split('\n');
      return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
        offset: pos,
      };
    }
  }
  return { line: 1, column: 1, offset: 0 };
}
