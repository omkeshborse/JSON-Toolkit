import { ErrorCategory } from './types';

export interface CategoryMeta {
  code: ErrorCategory;
  title: string;
  badgeColor: string; // Tailwind class
  description: string;
  isAutoRepairable: boolean;
}

export const ERROR_CATEGORIES: Record<ErrorCategory, CategoryMeta> = {
  TRAILING_COMMA: {
    code: 'TRAILING_COMMA',
    title: 'Trailing Comma',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'JSON specification (RFC 8259) forbids trailing commas after the last element or property.',
    isAutoRepairable: true,
  },
  SINGLE_QUOTES: {
    code: 'SINGLE_QUOTES',
    title: 'Single Quotes',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Strings and object property names in JSON must be enclosed in double quotes ("), not single quotes (\').',
    isAutoRepairable: true,
  },
  UNQUOTED_KEY: {
    code: 'UNQUOTED_KEY',
    title: 'Unquoted Key',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'Object property keys must be wrapped in double quotes.',
    isAutoRepairable: true,
  },
  COMMENTS_PRESENT: {
    code: 'COMMENTS_PRESENT',
    title: 'Comment in JSON',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    description: 'Standard JSON does not permit single-line (//) or multi-line (/* */) comments.',
    isAutoRepairable: true,
  },
  PYTHON_LITERALS: {
    code: 'PYTHON_LITERALS',
    title: 'Python / Non-JSON Literals',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Python literals True, False, and None must be converted to JSON-compliant true, false, and null.',
    isAutoRepairable: true,
  },
  UNESCAPED_CHARACTERS: {
    code: 'UNESCAPED_CHARACTERS',
    title: 'Unescaped Characters',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Control characters such as raw unescaped newlines or unescaped quotes inside strings are illegal in JSON.',
    isAutoRepairable: true,
  },
  MISSING_COLON: {
    code: 'MISSING_COLON',
    title: 'Missing Colon',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    description: 'Object key and value pairs must be separated by a colon (:).',
    isAutoRepairable: true,
  },
  MISSING_COMMA: {
    code: 'MISSING_COMMA',
    title: 'Missing Comma',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    description: 'Elements in an array or properties in an object must be separated by commas.',
    isAutoRepairable: true,
  },
  UNCLOSED_DELIMITER: {
    code: 'UNCLOSED_DELIMITER',
    title: 'Unclosed Delimiter',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    description: 'An open bracket, brace, or string delimiter was left unclosed before the end of the document.',
    isAutoRepairable: true,
  },
  MISMATCHED_BRACKETS: {
    code: 'MISMATCHED_BRACKETS',
    title: 'Mismatched Brackets',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    description: 'A closing brace or bracket does not match the opening structure (e.g., "{" closed by "]").',
    isAutoRepairable: true,
  },
  UNEXPECTED_TOKEN: {
    code: 'UNEXPECTED_TOKEN',
    title: 'Unexpected Token',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    description: 'An invalid character or out-of-place token was encountered.',
    isAutoRepairable: false,
  },
  EMPTY_INPUT: {
    code: 'EMPTY_INPUT',
    title: 'Empty Input',
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    description: 'The JSON input contains no values.',
    isAutoRepairable: false,
  },
  DUPLICATE_KEY: {
    code: 'DUPLICATE_KEY',
    title: 'Duplicate Key',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    description: 'Duplicate key detected in object. While allowed by some parsers, RFC 8259 advises unique keys to prevent data overwriting.',
    isAutoRepairable: false,
  },
  NDJSON_FORMAT: {
    code: 'NDJSON_FORMAT',
    title: 'NDJSON / JSON Lines',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Input consists of multiple newline-delimited JSON objects. Standard JSON requires wrapping multiple items in an array [].',
    isAutoRepairable: false,
  },
  HTML_INPUT: {
    code: 'HTML_INPUT',
    title: 'HTML / XML Document',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'The provided document appears to be HTML or XML markup rather than JSON.',
    isAutoRepairable: false,
  },
  OTHER_SYNTAX_ERROR: {
    code: 'OTHER_SYNTAX_ERROR',
    title: 'Syntax Error',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    description: 'The JSON string violates standard RFC 8259 syntax specifications.',
    isAutoRepairable: false,
  },
};
