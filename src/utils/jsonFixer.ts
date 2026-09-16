export interface JsonFixResult {
  fixedJson: string;
  repaired: boolean;
  fixesApplied: string[];
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

  const fixes: string[] = [];
  let text = raw.trim();

  // Try parsing directly first
  try {
    const parsed = JSON.parse(text);
    return {
      fixedJson: JSON.stringify(parsed, null, 2),
      repaired: false,
      fixesApplied: ['Already valid JSON - formatted nicely'],
    };
  } catch {
    // Needs repair
  }

  // 1. Remove JavaScript comments: // and /* */
  if (/\/\/.*|\/\*[\s\S]*?\*\//.test(text)) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    fixes.push('Removed comments (// and /* */)');
  }

  // 2. Fix Python-style True, False, None
  if (/\bTrue\b/.test(text)) {
    text = text.replace(/\bTrue\b/g, 'true');
    fixes.push('Replaced True with true');
  }
  if (/\bFalse\b/.test(text)) {
    text = text.replace(/\bFalse\b/g, 'false');
    fixes.push('Replaced False with false');
  }
  if (/\bNone\b/.test(text)) {
    text = text.replace(/\bNone\b/g, 'null');
    fixes.push('Replaced None with null');
  }

  // 3. Fix single quotes around strings or keys
  // Simple regex heuristic for single quotes
  if (/'([^'\\]*(?:\\.[^'\\]*)*)'/.test(text)) {
    text = text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_match, p1) => {
      const escaped = p1.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    fixes.push('Converted single quotes to double quotes');
  }

  // 4. Fix unquoted keys in objects: e.g. { foo: 123, bar_baz: "abc" }
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g;
  if (unquotedKeyRegex.test(text)) {
    text = text.replace(unquotedKeyRegex, '$1"$2":');
    fixes.push('Added double quotes around unquoted object keys');
  }

  // 5. Remove trailing commas before } or ]
  const trailingCommaRegex = /,\s*([\]}])/g;
  if (trailingCommaRegex.test(text)) {
    text = text.replace(trailingCommaRegex, '$1');
    fixes.push('Removed trailing commas');
  }

  // 6. Fix missing closing brackets/braces heuristic if obvious
  const openBraces = (text.match(/\{/g) || []).length;
  const closeBraces = (text.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    text = text + '}'.repeat(openBraces - closeBraces);
    fixes.push(`Appended ${openBraces - closeBraces} missing closing brace(s)`);
  }

  const openBrackets = (text.match(/\[/g) || []).length;
  const closeBrackets = (text.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    text = text + ']'.repeat(openBrackets - closeBrackets);
    fixes.push(`Appended ${openBrackets - closeBrackets} missing closing bracket(s)`);
  }

  // Verify if it parses now
  try {
    const parsed = JSON.parse(text);
    return {
      fixedJson: JSON.stringify(parsed, null, 2),
      repaired: true,
      fixesApplied: fixes.length > 0 ? fixes : ['Cleaned formatting syntax'],
    };
  } catch (err: any) {
    return {
      fixedJson: text,
      repaired: false,
      fixesApplied: fixes,
      error: `Could not fully auto-repair: ${err?.message || 'Syntax error'}`,
    };
  }
}
