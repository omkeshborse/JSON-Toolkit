import { FixChangeDetail } from './types';

export interface RepairResult {
  text: string;
  changes: FixChangeDetail[];
}

export function applyDeterministicRepairs(raw: string): RepairResult {
  let s = raw;
  const changes: FixChangeDetail[] = [];

  // 1. Remove Comments (single line // and multi line /* */)
  let commentsRemoved = 0;
  // Regex that preserves comments inside strings
  const commentRegex = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(\/\/[^\n\r]*)|(\/\*[\s\S]*?\*\/)/g;
  const noComments = s.replace(commentRegex, (match, dStr, sStr, lineComm, blockComm) => {
    if (dStr) return dStr;
    if (sStr) return sStr;
    if (lineComm || blockComm) {
      commentsRemoved++;
      return '';
    }
    return match;
  });

  if (commentsRemoved > 0) {
    s = noComments;
    changes.push({
      category: 'COMMENTS_PRESENT',
      description: `Removed ${commentsRemoved} comment${commentsRemoved > 1 ? 's' : ''}`,
      count: commentsRemoved,
    });
  }

  // 2. Python / Non-JSON Literals (True/TRUE -> true, False/FALSE -> false, None/NULL -> null) outside of strings
  let pythonFixes = 0;
  const pythonRegex = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|\b(True|TRUE|False|FALSE|None|NULL)\b/g;
  const pythonFixed = s.replace(pythonRegex, (match, dStr, sStr, pyLit) => {
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
    s = pythonFixed;
    changes.push({
      category: 'PYTHON_LITERALS',
      description: `Converted ${pythonFixes} non-standard literal${pythonFixes > 1 ? 's' : ''} (True/FALSE/None/NULL) to standard JSON`,
      count: pythonFixes,
    });
  }

  // 3. Single quotes to double quotes for strings & keys
  let singleQuoteFixes = 0;
  const sqRegex = /("(?:\\.|[^"\\])*")|'((?:\\.|[^'\\])*)'/g;
  const sqFixed = s.replace(sqRegex, (match, dStr, sqContent) => {
    if (dStr) return dStr;
    if (sqContent !== undefined) {
      singleQuoteFixes++;
      // Unescape \' to ', then escape unescaped " to \"
      const escaped = sqContent
        .replace(/\\'/g, "'")
        .replace(/"/g, '\\"');
      return `"${escaped}"`;
    }
    return match;
  });

  if (singleQuoteFixes > 0) {
    s = sqFixed;
    changes.push({
      category: 'SINGLE_QUOTES',
      description: `Replaced ${singleQuoteFixes} single-quoted string${singleQuoteFixes > 1 ? 's' : ''} with double quotes`,
      count: singleQuoteFixes,
    });
  }

  // 4. Unquoted object keys (e.g. { foo: "bar", _count: 10, $id: 1 })
  let unquotedKeyFixes = 0;
  const unquotedRegex = /("(?:\\.|[^"\\])*")|([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g;
  const unquotedFixed = s.replace(unquotedRegex, (match, dStr, prefix, key) => {
    if (dStr) return dStr;
    if (prefix && key) {
      unquotedKeyFixes++;
      return `${prefix}"${key}":`;
    }
    return match;
  });

  if (unquotedKeyFixes > 0) {
    s = unquotedFixed;
    changes.push({
      category: 'UNQUOTED_KEY',
      description: `Double-quoted ${unquotedKeyFixes} unquoted object key${unquotedKeyFixes > 1 ? 's' : ''}`,
      count: unquotedKeyFixes,
    });
  }

  // 5. Trailing commas in arrays and objects (e.g. [1, 2,] or {"a": 1,})
  let trailingCommaFixes = 0;
  const trailingCommaRegex = /("(?:\\.|[^"\\])*")|(,)(\s*[}\]])/g;
  const trailingFixed = s.replace(trailingCommaRegex, (match, dStr, comma, closing) => {
    if (dStr) return dStr;
    if (comma && closing) {
      trailingCommaFixes++;
      return closing;
    }
    return match;
  });

  if (trailingCommaFixes > 0) {
    s = trailingFixed;
    changes.push({
      category: 'TRAILING_COMMA',
      description: `Stripped ${trailingCommaFixes} illegal trailing comma${trailingCommaFixes > 1 ? 's' : ''}`,
      count: trailingCommaFixes,
    });
  }

  // 6. Missing commas between consecutive lines of key-value pairs or items:
  // e.g. "a": 1 \n "b": 2  or  "item1" \n "item2"
  let missingCommaFixes = 0;
  const missingCommaRegex = /("(?:\\.|[^"\\])*"|[0-9]+|true|false|null|[}\]])\s*(\n\s*)("(?:\\.|[^"\\])*"|[0-9]+|true|false|null|[{[])/g;
  const commaFixed = s.replace(missingCommaRegex, (match, val1, whitespace, val2) => {
    // Check if val1 and val2 shouldn't have a colon in between
    // If val2 is followed immediately by a colon without opening brace, val2 is a key!
    missingCommaFixes++;
    return `${val1},${whitespace}${val2}`;
  });

  // Verify if comma injection didn't break valid JSON
  try {
    JSON.parse(commaFixed);
    if (missingCommaFixes > 0) {
      s = commaFixed;
      changes.push({
        category: 'MISSING_COMMA',
        description: `Inserted ${missingCommaFixes} missing comma${missingCommaFixes > 1 ? 's' : ''} between entries`,
        count: missingCommaFixes,
      });
    }
  } catch {
    // Keep s as before if commaFixed did not produce valid JSON
  }

  // 7. Bracket and Brace Balance (Unclosed Delimiters)
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

  // If in unclosed string at EOF, close quote
  if (inString) {
    s += '"';
    changes.push({
      category: 'UNCLOSED_DELIMITER',
      description: 'Closed unclosed string literal at end of payload',
      count: 1,
    });
  }

  // If there are unclosed brackets/braces
  if (openStack.length > 0) {
    const missingClosing = openStack.reverse().join('');
    s = s.trimEnd() + missingClosing;
    changes.push({
      category: 'UNCLOSED_DELIMITER',
      description: `Appended ${missingClosing.length} missing closing delimiter(s): ${missingClosing}`,
      count: missingClosing.length,
    });
  }

  return { text: s, changes };
}
