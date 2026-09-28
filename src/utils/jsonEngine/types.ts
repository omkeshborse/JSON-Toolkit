export type TokenType =
  | 'OpenBrace'       // {
  | 'CloseBrace'      // }
  | 'OpenBracket'     // [
  | 'CloseBracket'    // ]
  | 'Colon'           // :
  | 'Comma'           // ,
  | 'String'          // "..."
  | 'SingleQuoteString' // '...'
  | 'Number'          // 123, -4.5e6
  | 'Boolean'         // true, false
  | 'Null'            // null
  | 'PythonLiteral'   // True, False, None
  | 'Identifier'      // unquoted key/word
  | 'Comment'         // // or /* */
  | 'Whitespace'      // spaces, tabs, newlines
  | 'Unknown'         // unexpected char
  | 'EOF';

export interface SourcePosition {
  offset: number;
  line: number;
  column: number;
}

export interface Token {
  type: TokenType;
  value: string;
  start: SourcePosition;
  end: SourcePosition;
  raw: string;
}

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type ErrorCategory =
  | 'TRAILING_COMMA'
  | 'SINGLE_QUOTES'
  | 'UNQUOTED_KEY'
  | 'COMMENTS_PRESENT'
  | 'PYTHON_LITERALS'
  | 'UNESCAPED_CHARACTERS'
  | 'MISSING_COLON'
  | 'MISSING_COMMA'
  | 'UNCLOSED_DELIMITER'
  | 'MISMATCHED_BRACKETS'
  | 'UNEXPECTED_TOKEN'
  | 'EMPTY_INPUT'
  | 'DUPLICATE_KEY'
  | 'NDJSON_FORMAT'
  | 'HTML_INPUT'
  | 'OTHER_SYNTAX_ERROR';

export interface JsonErrorDiagnostic {
  id: string;
  code: ErrorCategory;
  message: string;
  severity: ErrorSeverity;
  line: number;
  column: number;
  offset: number;
  length: number;
  snippet?: string;
  suggestedFix?: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FixChangeDetail {
  category: ErrorCategory;
  description: string;
  count: number;
}

export interface RepairCandidate {
  original: string;
  repaired: string;
  isValid: boolean;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  changes: FixChangeDetail[];
  diagnosticsBefore: JsonErrorDiagnostic[];
  diagnosticsAfter: JsonErrorDiagnostic[];
  nativeErrorBefore?: string;
  nativeErrorAfter?: string;
}
