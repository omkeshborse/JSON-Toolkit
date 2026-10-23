export interface GuideCodeExample {
  title?: string;
  language: string;
  code: string;
  caption?: string;
  highlightLines?: number[];
  tested?: boolean;
}

export interface GuideCallout {
  type: 'info' | 'warning' | 'tip' | 'note';
  title: string;
  content: string;
}

export interface GuideComparisonRow {
  label: string;
  invalidCode: string;
  validCode: string;
  explanation: string;
}

export interface GuideSection {
  id: string;
  heading: string;
  level?: 2 | 3;
  paragraphs: string[];
  lists?: {
    type: 'bullet' | 'ordered';
    items: string[];
  }[];
  codeExamples?: GuideCodeExample[];
  comparisonRows?: GuideComparisonRow[];
  callout?: GuideCallout;
}

export interface GuideQuestionAnswer {
  question: string;
  sectionId: string;
  shortAnswer: string;
}

export interface GuideCta {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  badge?: string;
  secondaryText?: string;
  secondaryUrl?: string;
}

export interface RelatedGuideLink {
  slug: string;
  route: string;
  title: string;
  description: string;
  primaryKeyword: string;
}

export interface GuideArticle {
  slug: string;
  route: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  supportingKeywords: string[];
  questionQueries: GuideQuestionAnswer[];
  intro: {
    lead: string;
    paragraphs: string[];
  };
  sections: GuideSection[];
  primaryCta: GuideCta;
  secondaryCta?: GuideCta;
  breadcrumbs: { label: string; to?: string }[];
  relatedGuides: RelatedGuideLink[];
  datePublished: string;
  dateModified: string;
  readTime: string;
}

export const GUIDES_DATA: Record<string, GuideArticle> = {
  'how-to-fix-common-json-syntax-errors': {
    slug: 'how-to-fix-common-json-syntax-errors',
    route: '/guides/how-to-fix-common-json-syntax-errors',
    seoTitle: 'How to Fix JSON Syntax Errors: Common Parse Errors & Solutions',
    metaDescription: 'Learn how to fix JSON syntax errors including trailing commas, unquoted keys, single quotes, and position 0 tokens with step-by-step RFC 8259 repair workflows.',
    h1: 'How to Fix Common JSON Syntax Errors (RFC 8259 Guide)',
    primaryKeyword: 'how to fix json syntax errors',
    supportingKeywords: [
      'unexpected token in json at position 0',
      'json trailing comma syntax error',
      'unquoted property key json error',
      'single quotes in json error',
      'rfc 8259 json parse error',
      'fix broken json online',
    ],
    questionQueries: [
      {
        question: 'Why does standard JSON disallow trailing commas?',
        sectionId: 'trailing-commas',
        shortAnswer: 'RFC 8259 strictly defines JSON array and object grammar with commas only as element separators between values, never after the final item, ensuring single-pass parser determinism.',
      },
      {
        question: 'How do I fix single quotes in a JSON payload?',
        sectionId: 'single-quotes',
        shortAnswer: 'Standard JSON strings must be enclosed in double quotes ("). Replace single-quote delimiters while preserving internal apostrophes, or use an AST-based parser repair.',
      },
      {
        question: 'What does "Unexpected token < in JSON" mean?',
        sectionId: 'unexpected-token-position-0',
        shortAnswer: 'An unexpected token "<" at position 0 almost always indicates that your application received an HTML error response (like a 404, 500, or login page) instead of valid JSON data.',
      },
    ],
    intro: {
      lead: 'Learning how to fix json syntax errors requires understanding the strict grammatical constraints of RFC 8259.',
      paragraphs: [
        'Developers frequently write JavaScript object literals or Python dictionary representations assuming they are valid JSON. However, standard JSON (RFC 8259) is a rigorous data interchange format with zero tolerance for trailing commas, unquoted keys, single quotes, or comments.',
        'When your backend API, build step, or frontend application crashes with a fatal JSON parse error, locating the offending token and understanding why the parser rejected it is the fastest path to remediation. This technical guide explains the underlying causes of the six most frequent parse failures and provides deterministic, safe repair workflows.',
      ],
    },
    sections: [
      {
        id: 'strict-json-vs-javascript',
        heading: 'Strict JSON Grammar Under RFC 8259 vs. JavaScript Object Literals',
        paragraphs: [
          'The fundamental source of most parse issues is confusing JavaScript object literal syntax with the JSON standard. While modern ECMAScript allows trailing commas, unquoted identifiers, template strings, and single quotes, RFC 8259 strictly forbids them.',
          'An RFC 8259 json parse error occurs whenever a conforming parser encounters any character outside the formal JSON grammar state machine. JSON requires every string and object key to be enclosed in standard ASCII double quotes (`"`), every numeric literal to conform to strict decimal notation without leading zeroes, and every structural separator to strictly follow the grammar.',
        ],
        callout: {
          type: 'warning',
          title: 'RFC 8259 Specification Constraint',
          content: 'RFC 8259 Section 7 states: "A string begins and ends with quotation marks... All characters may be placed within the quotation marks, except for the characters that MUST be escaped: quotation mark, reverse solidus, and the control characters (U+0000 through U+001F)." Single quotes are invalid delimiters.',
        },
      },
      {
        id: 'trailing-commas',
        heading: 'Why Does Standard JSON Disallow Trailing Commas? (json trailing comma syntax error)',
        paragraphs: [
          'A json trailing comma syntax error is the single most common syntax defect encountered in hand-edited configuration files (such as `package.json`, `tsconfig.json`, or Docker configs).',
          'In JavaScript (ES5+) and Python, trailing commas after the last item of an array or object are legal and encouraged to create clean git diffs. In standard JSON, however, the comma is defined strictly as a separator between two members, not a terminator. When a parser encounters a comma followed immediately by a closing bracket `]` or brace `}`, it expects a subsequent value; encountering the closing delimiter triggers an immediate syntax error.',
        ],
        comparisonRows: [
          {
            label: 'Trailing comma in JSON Object',
            invalidCode: '{\n  "service": "api-gateway",\n  "port": 8080,\n}',
            validCode: '{\n  "service": "api-gateway",\n  "port": 8080\n}',
            explanation: 'Remove the comma after the final property value. Comma is only allowed between items.',
          },
          {
            label: 'Trailing comma in JSON Array',
            invalidCode: '[\n  "admin",\n  "developer",\n  "viewer",\n]',
            validCode: '[\n  "admin",\n  "developer",\n  "viewer"\n]',
            explanation: 'Remove the comma after the last array entry "viewer".',
          },
        ],
      },
      {
        id: 'single-quotes',
        heading: 'How Do I Fix Single Quotes in a JSON Payload? (single quotes in json error)',
        paragraphs: [
          'A single quotes in json error occurs when strings or property names are wrapped with single quotation marks (`\'`) rather than double quotation marks (`"`). This typically happens when copying data out of Python console outputs (`str(dict)`), MongoDB shells, or JavaScript logs.',
          'Fixing single quotes requires care: executing a blind global string replacement like `.replace(/\'/g, \'"\')` can corrupt your data if any text contains apostrophes (e.g., `"user": \'O\'Connor\'` would turn into `"user": "O"Connor"` which creates another parse error!).',
          'The correct programmatic solution is to tokenize string boundaries or use a deterministic AST scanner that only replaces quote delimiters at string boundaries while escaping any nested double quotes.',
        ],
        comparisonRows: [
          {
            label: 'Single-quoted keys and values',
            invalidCode: "{\n  'status': 'success',\n  'code': 200\n}",
            validCode: '{\n  "status": "success",\n  "code": 200\n}',
            explanation: 'Both property keys and string values must strictly use ASCII double quotes (").',
          },
          {
            label: 'Strings containing apostrophes',
            invalidCode: "{\n  'message': 'User\\'s session expired'\n}",
            validCode: '{\n  "message": "User\'s session expired"\n}',
            explanation: 'Wrap the outer boundary in double quotes; the interior apostrophe is a standard character and requires no backslash in JSON.',
          },
        ],
      },
      {
        id: 'unquoted-keys',
        heading: 'Unquoted Property Keys (unquoted property key json error)',
        paragraphs: [
          'In JavaScript, writing `{ name: "Alice", active: true }` is standard shorthand. When pasted into a JSON parser, this triggers an unquoted property key json error because RFC 8259 requires all object member names to be JSON strings.',
          'Unquoted keys cannot be parsed because the JSON grammar distinguishes identifiers from keywords (`true`, `false`, `null`). Without quotation marks, the parser encounters unexpected alphabetic tokens where a string token was expected.',
        ],
        comparisonRows: [
          {
            label: 'Unquoted object keys',
            invalidCode: '{\n  id: 1042,\n  hostname: "edge-01",\n  region: "us-east"\n}',
            validCode: '{\n  "id": 1042,\n  "hostname": "edge-01",\n  "region": "us-east"\n}',
            explanation: 'Surround every property name in double quotation marks.',
          },
        ],
      },
      {
        id: 'unexpected-token-position-0',
        heading: 'What Does "Unexpected token < in JSON" Mean? (unexpected token in json at position 0)',
        paragraphs: [
          'The notorious error `SyntaxError: Unexpected token < in JSON at position 0` (or `Unexpected token \'<\'`) is one of the most frequently asked questions in web development.',
          'This error occurs when an application calls `JSON.parse(response)` or `response.json()` expecting a JSON payload, but the server returned HTML. Because HTML documents begin with `<!DOCTYPE html>` or `<html`, character position 0 is `<`. The JSON parser encounters `<` where it expected `{`, `[`, `"`, or a digit, immediately throwing an unexpected token in json at position 0 error.',
          'Common root causes include:',
        ],
        lists: [
          {
            type: 'bullet',
            items: [
              'The API route returned an HTTP 404 Not Found error rendered as an HTML error page.',
              'The server suffered an unhandled 500 Internal Server Error and returned an HTML stack trace.',
              'An authentication middleware or proxy redirected the request to an HTML login screen.',
              'A captive portal (e.g., hotel or airport Wi-Fi) intercepted the HTTP request with a landing page.',
              'The file was saved with an invisible UTF-8 Byte Order Mark (BOM: `\uFEFF`) at the beginning of the stream.',
            ],
          },
        ],
        callout: {
          type: 'tip',
          title: 'Defensive Fetch Diagnostic',
          content: 'Always check `response.ok` or inspect `response.text()` before attempting to parse JSON. If the response starts with "<", log the response text to see the underlying HTML error page.',
        },
      },
      {
        id: 'programmatic-diagnostics',
        heading: 'Programmatic Parse Diagnostics: JavaScript vs. Python',
        paragraphs: [
          'When debugging JSON programmatically, native language parsers provide exact error locations and message contexts. Here is how to reliably capture and inspect parse errors in JavaScript and Python without crashing your application.',
        ],
        codeExamples: [
          {
            title: 'Node.js / JavaScript Defensive Parsing',
            language: 'typescript',
            code: `function safeParseJson<T>(raw: string): { data: T | null; error: string | null; line?: number } {
  try {
    const data = JSON.parse(raw) as T;
    return { data, error: null };
  } catch (err) {
    if (err instanceof SyntaxError) {
      // In Node.js 19+ and modern browsers, err.message includes line and column:
      // e.g. "Unexpected token '}', ... is not valid JSON at position 42 (line 3 column 1)"
      return { data: null, error: err.message };
    }
    return { data: null, error: String(err) };
  }
}`,
            caption: 'Extracts exact parse failure details using native JavaScript SyntaxError messages.',
          },
          {
            title: 'Python json.loads() with JSONDecodeError Diagnostic',
            language: 'python',
            code: `import json

def inspect_json(raw_text: str):
    try:
        data = json.loads(raw_text)
        print("JSON is valid RFC 8259.")
        return data
    except json.JSONDecodeError as exc:
        print(f"RFC 8259 Parse Error: {exc.msg}")
        print(f"Location: Line {exc.lineno}, Column {exc.colno} (Char index {exc.pos})")
        # Print snippet showing error position
        lines = raw_text.splitlines()
        if 0 < exc.lineno <= len(lines):
            print(f"Problematic line: {lines[exc.lineno - 1]}")
            print(f"Pointer:          {' ' * (exc.colno - 1)}^")
        return None`,
            caption: 'Python JSONDecodeError exposes lineno, colno, pos, and error message directly.',
          },
        ],
      },
      {
        id: 'deterministic-repair-workflow',
        heading: 'A Deterministic 4-Step Workflow to Fix Broken JSON Online',
        paragraphs: [
          'When you need to fix broken json online, avoid arbitrary search-and-replace scripts that can corrupt valid string data. Instead, follow this deterministic four-step workflow:',
        ],
        lists: [
          {
            type: 'ordered',
            items: [
              'Inspect Error Coordinates: Check the line, column, and token reported by your parser or our linter.',
              'Identify the Token Violation: Determine whether the defect is a trailing comma, missing quote, single quote, comment, or unquoted key.',
              'Apply Structural Repair: Convert keys to double quotes, strip trailing commas, and replace invalid single-quote delimiters while preserving nested apostrophes.',
              'Validate Against RFC 8259: Run the repaired text through the validator to verify that the entire document tree evaluates cleanly with standard JSON.parse().',
            ],
          },
        ],
      },
    ],
    primaryCta: {
      title: 'Validate and Repair JSON Syntax',
      description: 'Paste your payload into our interactive linter with deterministic Smart Fix, line/column diagnostics, and RFC 8259 syntax checking.',
      buttonText: 'validate your JSON syntax',
      buttonUrl: '/json-validator',
      badge: 'Interactive Linter',
      secondaryText: 'format and inspect corrected JSON',
      secondaryUrl: '/json-formatter',
    },
    breadcrumbs: [
      { label: 'Guides', to: '/guides' },
      { label: 'Fix Common JSON Syntax Errors' },
    ],
    relatedGuides: [
      {
        slug: 'how-to-compare-json-objects-differing-key-order',
        route: '/guides/how-to-compare-json-objects-differing-key-order',
        title: 'How to Compare JSON Objects When Key Order Differs',
        description: 'Compare two JSON objects ignoring key order using semantic diffing and recursive sorting.',
        primaryKeyword: 'compare json objects ignore key order',
      },
      {
        slug: 'jsonpath-examples-querying-nested-api-responses',
        route: '/guides/jsonpath-examples-querying-nested-api-responses',
        title: 'JSONPath Examples for Querying Nested API Responses',
        description: 'Extract nested API data with practical JSONPath queries, filters, and recursive descent.',
        primaryKeyword: 'jsonpath examples for api responses',
      },
    ],
    datePublished: '2026-10-23',
    dateModified: '2026-10-23',
    readTime: '6 min read',
  },

  'how-to-compare-json-objects-differing-key-order': {
    slug: 'how-to-compare-json-objects-differing-key-order',
    route: '/guides/how-to-compare-json-objects-differing-key-order',
    seoTitle: 'Compare JSON Objects Ignore Key Order: Semantic Diff Guide',
    metaDescription: 'Learn how to compare JSON objects ignore key order using recursive key sorting, semantic diff tools, and bash jq commands without false git changes.',
    h1: 'How to Compare JSON Objects When Key Order Differs',
    primaryKeyword: 'compare json objects ignore key order',
    supportingKeywords: [
      'compare two json files ignore key order',
      'semantic json diff online',
      'json diff order independent',
      'diff two json files different formatting',
      'json structural diff tool',
      'compare json in bash with jq',
    ],
    questionQueries: [
      {
        question: 'Does key order matter in JSON (RFC 8259)?',
        sectionId: 'rfc8259-key-order',
        shortAnswer: 'According to RFC 8259 Section 1, JSON objects are unordered collections of key/value pairs. Two objects with the same keys and values in different orders represent identical semantic data. However, array element order is strictly significant.',
      },
      {
        question: 'Why does git diff show false changes on identical JSON files?',
        sectionId: 'git-diff-false-positives',
        shortAnswer: 'Git diff is a line-oriented textual comparison tool. When serialization engines reorder keys or change whitespace indentation, Git flags entire blocks as modified even though the underlying data structure has not changed.',
      },
      {
        question: 'How do I compare two API responses without false diffs?',
        sectionId: 'api-regression-testing',
        shortAnswer: 'Canonicalize both API responses by recursively sorting object keys and masking dynamic values like timestamps and request IDs before running a semantic diff.',
      },
    ],
    intro: {
      lead: 'When testing APIs and comparing configuration files, you frequently need to compare json objects ignore key order.',
      paragraphs: [
        'Standard text comparison tools like `diff`, `git diff`, or simple file comparisons operate on raw lines and character offsets. Because serialization libraries in languages like Go, Python, Java, and Node.js often output object keys in non-deterministic order (such as hash-table bucket iteration), two files containing identical data can produce a massive, confusing diff.',
        'This technical guide explains how to perform a semantic json diff online, how RFC 8259 specifies object vs array ordering, how to canonicalize JSON in the terminal with `jq`, and how to compare two json files ignore key order accurately.',
      ],
    },
    sections: [
      {
        id: 'textual-vs-semantic-diff',
        heading: 'Textual Equality vs. Semantic JSON Comparison',
        paragraphs: [
          'A textual comparison treats a JSON document as a sequence of raw bytes or strings. If file A formats properties with 2 spaces and file B formats them with 4 spaces or reorders keys, a textual diff tool flags every single line as changed.',
          'By contrast, a semantic json diff online parses both documents into Abstract Syntax Trees (ASTs) or native in-memory data structures. It evaluates the logical structure, ignoring superficial discrepancies in formatting, whitespace, indentation, and object key ordering.',
        ],
        codeExamples: [
          {
            title: 'Semantically Identical JSON Objects with Different Key Order',
            language: 'json',
            code: `// Document A
{
  "status": "ready",
  "port": 8080,
  "service": "billing-service"
}

// Document B (Identical Data, Different Key Order)
{
  "service": "billing-service",
  "status": "ready",
  "port": 8080
}`,
            caption: 'A line-by-line diff tool reports 100% changed lines. A semantic diff tool identifies these as 100% identical.',
          },
        ],
      },
      {
        id: 'rfc8259-key-order',
        heading: 'Does Key Order Matter in JSON (RFC 8259)? Objects vs. Arrays',
        paragraphs: [
          'The definitive authority on JSON ordering semantics is IETF RFC 8259 ("The JavaScript Object Notation Data Interchange Format"). RFC 8259 defines two structural collection types with fundamentally different ordering contracts:',
        ],
        lists: [
          {
            type: 'bullet',
            items: [
              'JSON Objects (Unordered): Section 1 defines an object as "an unordered collection of zero or more name/value pairs". Section 4 further clarifies that "JSON parsing libraries should not make semantics depend on the ordering of key/value pairs."',
              'JSON Arrays (Strictly Ordered): Section 1 defines an array as "an ordered sequence of zero or more values". Array element order is strictly preserved and significant.',
            ],
          },
        ],
        comparisonRows: [
          {
            label: 'Object Keys (Order Independent)',
            invalidCode: '{\n  "name": "Widget",\n  "sku": "W-1"\n}',
            validCode: '{\n  "sku": "W-1",\n  "name": "Widget"\n}',
            explanation: 'Both objects represent the exact same entity. Key order difference is semantically insignificant under RFC 8259.',
          },
          {
            label: 'Array Elements (Order Significant)',
            invalidCode: '[\n  "first_step",\n  "second_step"\n]',
            validCode: '[\n  "second_step",\n  "first_step"\n]',
            explanation: 'These two arrays are NOT equivalent! Array indexes [0] and [1] are swapped, which can break execution sequences or sorted rankings.',
          },
        ],
        callout: {
          type: 'warning',
          title: 'Crucial Caveat: Arrays Are Never Order-Independent',
          content: 'Recursive object-key sorting does not and must not reorder array elements. Swapping `[1, 2]` with `[2, 1]` is a genuine structural difference. A true json diff order independent engine only sorts object property keys, preserving array index sequences.',
        },
      },
      {
        id: 'git-diff-false-positives',
        heading: 'Why Does Git Diff Show False Changes on Identical JSON Files?',
        paragraphs: [
          'Git operates as a content tracker based on lines of text, hashing file contents into blobs. When a backend service changes its dictionary serialization logic (for example, switching from Python 3.6+ insertion-ordered dicts to an unordered map), Git sees every single line as deleted and re-inserted.',
          'To diff two json files different formatting or differing key orders without false positives, you must canonicalize the files before invoking diff tools. This is where canonical key sorting provides immense value in CI/CD pipelines and pull requests.',
        ],
      },
      {
        id: 'bash-jq-comparison',
        heading: 'How to Compare JSON in Bash with JQ (compare json in bash with jq)',
        paragraphs: [
          'The standard UNIX utility `jq` provides a built-in flag `--sort-keys` (or `-S`) that recursively sorts all object keys in alphabetical order while preserving array element order. This makes it easy to compare json in bash with jq directly in your terminal.',
          'Here is the verified bash workflow tested against jq versions 1.6 and 1.7:',
        ],
        codeExamples: [
          {
            title: 'Process Substitution Diff with JQ',
            language: 'bash',
            code: `# Compare two JSON files in bash ignoring key order and whitespace:
diff -u <(jq --sort-keys . response_v1.json) <(jq --sort-keys . response_v2.json)

# Or with git diff for rich color output:
git diff --no-index <(jq -S . response_v1.json) <(jq -S . response_v2.json)`,
            caption: 'Process substitution canonicalizes both files on the fly without writing temporary files to disk.',
          },
          {
            title: 'Batch Canonicalization Script for Git Commits',
            language: 'bash',
            code: `#!/usr/bin/env bash
# Canonicalize all JSON files in a directory to prevent false git diffs
for file in configs/*.json; do
  jq --sort-keys --indent 2 . "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done
echo "All configuration files canonicalized with alphabetical key order."`,
            caption: 'Ensures deterministic key ordering across developer environments before committing.',
          },
        ],
      },
      {
        id: 'api-regression-testing',
        heading: 'How Do I Compare Two API Responses Without False Diffs?',
        paragraphs: [
          'In production API testing, automated regression suites often compare staging responses against production snapshots. Besides key order differences, two additional challenges cause false diffs:',
        ],
        lists: [
          {
            type: 'bullet',
            items: [
              'Dynamic Fields (Timestamps & IDs): Properties like `"createdAt": "2026-10-23T05:40:12Z"` or `"traceId": "d4e2f1..."` change on every run. Mask or delete these keys before comparison.',
              'Unordered Database Query Sets: If an endpoint returns an array of users without an explicit `ORDER BY` clause, the database may return `[Alice, Bob]` one moment and `[Bob, Alice]` the next. When array order is non-deterministic in your domain, sort the array by a unique identifier (`id`) prior to running diff.',
            ],
          },
        ],
      },
      {
        id: 'toolkit-diff-engine',
        heading: 'How Our JSON Structural Diff Tool Works',
        paragraphs: [
          '101 JSON Toolkit includes a built-in json structural diff tool designed specifically to solve this problem in your browser.',
          'Our comparison engine parses both input documents into memory and recursively collects all unique property keys from both sides, sorting them alphabetically (`Array.from(new Set([...keysA, ...keysB])).sort()`). It then evaluates values matching identical key paths. Additions, deletions, and value modifications are cleanly grouped and color-coded without false diffs triggered by key order.',
        ],
      },
    ],
    primaryCta: {
      title: 'Compare Two JSON Documents Online',
      description: 'Use our side-by-side structural diff engine with deep recursive key sorting, path search, and modification filters.',
      buttonText: 'compare two JSON objects online',
      buttonUrl: '/json-compare',
      badge: 'Semantic Diff Engine',
      secondaryText: 'inspect a structural JSON diff',
      secondaryUrl: '/json-compare',
    },
    breadcrumbs: [
      { label: 'Guides', to: '/guides' },
      { label: 'Compare JSON Differing Key Order' },
    ],
    relatedGuides: [
      {
        slug: 'how-to-fix-common-json-syntax-errors',
        route: '/guides/how-to-fix-common-json-syntax-errors',
        title: 'How to Fix Common JSON Syntax Errors (RFC 8259 Guide)',
        description: 'Fix parse errors like trailing commas, single quotes, and position 0 tokens.',
        primaryKeyword: 'how to fix json syntax errors',
      },
      {
        slug: 'jsonpath-examples-querying-nested-api-responses',
        route: '/guides/jsonpath-examples-querying-nested-api-responses',
        title: 'JSONPath Examples for Querying Nested API Responses',
        description: 'Extract nested API data with practical JSONPath queries, filters, and recursive descent.',
        primaryKeyword: 'jsonpath examples for api responses',
      },
    ],
    datePublished: '2026-10-23',
    dateModified: '2026-10-23',
    readTime: '7 min read',
  },

  'jsonpath-examples-querying-nested-api-responses': {
    slug: 'jsonpath-examples-querying-nested-api-responses',
    route: '/guides/jsonpath-examples-querying-nested-api-responses',
    seoTitle: 'JSONPath Examples for Querying Nested API Responses | Guide',
    metaDescription: 'Practical JSONPath examples for API responses: query nested objects, filter by boolean or numeric values, recursive descent, and array slicing.',
    h1: 'JSONPath Examples for Querying Nested API Responses',
    primaryKeyword: 'jsonpath examples for api responses',
    supportingKeywords: [
      'jsonpath query examples',
      'how to extract nested json with jsonpath',
      'jsonpath filter expression examples',
      'jsonpath recursive descent example',
      'jsonpath array slice notation',
      'query nested api data jsonpath',
    ],
    questionQueries: [
      {
        question: 'What does the $ symbol mean in JSONPath?',
        sectionId: 'root-selector-symbol',
        shortAnswer: 'The "$" symbol denotes the root object or root array of the JSON document being queried. Every absolute JSONPath query expression begins with "$".',
      },
      {
        question: 'What is the difference between $.item and $..item?',
        sectionId: 'recursive-descent-vs-direct',
        shortAnswer: '"$.item" selects an immediate child property named "item" directly under the root, whereas "$..item" performs recursive descent, searching and extracting all "item" properties at any nested depth throughout the entire document.',
      },
      {
        question: 'How do I filter a JSON array by boolean or numeric property?',
        sectionId: 'filter-expressions',
        shortAnswer: 'Use filter bracket syntax with the current item reference "@", such as `$.items[?(@.inStock === true)]` for booleans or `$.items[?(@.price < 50)]` for numeric thresholds.',
      },
    ],
    intro: {
      lead: 'Mastering jsonpath examples for api responses allows developers to extract precise data points from complex REST API payloads without writing boilerplate traversal code.',
      paragraphs: [
        'Modern microservice and webhook payloads frequently contain multiple tiers of nested dictionaries, arrays of metadata, and deeply embedded records. Writing nested loops with null checks (`data?.store?.inventory?.[0]?.price`) is brittle and tedious.',
        'JSONPath provides a declarative, standardized expression syntax to query nested api data jsonpath directly. This guide provides tested jsonpath query examples for real-world API responses, verified against our evaluator powered by jsonpath-plus.',
      ],
    },
    sections: [
      {
        id: 'sample-payload',
        heading: 'Realistic E-Commerce API Response Dataset',
        paragraphs: [
          'All examples throughout this guide execute against the following realistic e-commerce inventory API payload:',
        ],
        codeExamples: [
          {
            title: 'Sample E-Commerce API Response',
            language: 'json',
            code: `{
  "store": {
    "name": "TechMart",
    "location": "North America",
    "inventory": [
      {
        "id": "item_101",
        "name": "USB-C Cable",
        "category": "accessories",
        "price": 14.99,
        "inStock": true,
        "tags": ["cable", "power"]
      },
      {
        "id": "item_102",
        "name": "Mechanical Keyboard",
        "category": "peripherals",
        "price": 89.50,
        "inStock": true,
        "tags": ["keyboard", "rgb"]
      },
      {
        "id": "item_103",
        "name": "Ergonomic Mouse",
        "category": "peripherals",
        "price": 45.00,
        "inStock": false,
        "tags": ["mouse", "wireless"]
      },
      {
        "id": "item_104",
        "name": "4K Monitor",
        "category": "displays",
        "price": 299.99,
        "inStock": true,
        "tags": ["monitor", "hdr"]
      }
    ]
  }
}`,
            caption: 'Multi-tier JSON payload containing nested objects, an inventory array, primitives, and string arrays.',
          },
        ],
      },
      {
        id: 'root-selector-symbol',
        heading: 'What Does the $ Symbol Mean in JSONPath? Core Selectors Explained',
        paragraphs: [
          'The `$` symbol represents the root node of the JSON document. Every absolute JSONPath query begins at `$`. From the root, you navigate child properties using dot notation (`$.store.name`) or bracket notation (`$["store"]["name"]`).',
          'Child property accessors and wildcards (`*`) enable you to select all members across an array or object:',
        ],
        codeExamples: [
          {
            title: 'Root & Direct Child Selectors',
            language: 'text',
            code: `Query:  $.store.name
Result: ["TechMart"]
Explanation: Selects the "name" property of the root "store" object.

Query:  $.store.inventory[*].name
Result: ["USB-C Cable", "Mechanical Keyboard", "Ergonomic Mouse", "4K Monitor"]
Explanation: Wildcard (*) iterates through all inventory items and extracts the "name" field.`,
            caption: 'Verified against jsonpath-plus evaluator.',
          },
        ],
      },
      {
        id: 'recursive-descent-vs-direct',
        heading: 'Direct Child ($.item) vs. Recursive Descent ($..item) (jsonpath recursive descent example)',
        paragraphs: [
          'Understanding the distinction between single-dot direct child selection (`$.item`) and double-dot recursive descent (`$..item`) is crucial for building robust queries.',
          'While `$.store.inventory` requires knowing the exact path hierarchy, a jsonpath recursive descent example searches through all descendant nodes at any depth to extract matching properties:',
        ],
        codeExamples: [
          {
            title: 'Recursive Descent Query Examples',
            language: 'text',
            code: `Query:  $..price
Result: [14.99, 89.50, 45.00, 299.99]
Explanation: Recursively traverses all nested objects and returns every "price" property in the entire document.

Query:  $..tags[*]
Result: ["cable", "power", "keyboard", "rgb", "mouse", "wireless", "monitor", "hdr"]
Explanation: Finds all "tags" arrays at any depth and flattens their elements into a single list.`,
            caption: 'Recursive descent simplifies queries when data hierarchies vary or when querying deeply embedded structures.',
          },
        ],
        callout: {
          type: 'info',
          title: 'Implementation Note on JSONPath Evaluators',
          content: '101 JSON Toolkit uses jsonpath-plus (v10.4.0) for in-browser evaluation. While IETF RFC 9535 standardizes JSONPath semantics across languages, implementations in Python (jsonpath-ng), Java (Jayway), and JavaScript can exhibit minor differences in return types and filter syntax. Always verify expressions against your target runtime.',
        },
      },
      {
        id: 'filter-expressions',
        heading: 'How Do I Filter a JSON Array by Boolean or Numeric Property? (jsonpath filter expression examples)',
        paragraphs: [
          'Filter expressions allow conditional selection using the bracket-question syntax: `[?(expression)]`. Inside the filter, `@` refers to the current item in the array being evaluated.',
          'Here are verified jsonpath filter expression examples showing how to extract nested json with jsonpath based on dynamic conditions:',
        ],
        codeExamples: [
          {
            title: 'Boolean Filter Query',
            language: 'text',
            code: `Query:  $.store.inventory[?(@.inStock === true)].name
Result: ["USB-C Cable", "Mechanical Keyboard", "4K Monitor"]
Explanation: Filters the inventory collection down to items where inStock is true, extracting their names.

Query:  $.store.inventory[?(@.inStock === false)].name
Result: ["Ergonomic Mouse"]
Explanation: Returns only out-of-stock items.`,
            caption: 'Boolean filter expressions evaluated with exact type comparison.',
          },
          {
            title: 'Numeric Comparison Filter Query',
            language: 'text',
            code: `Query:  $.store.inventory[?(@.price < 50)].name
Result: ["USB-C Cable", "Ergonomic Mouse"]
Explanation: Evaluates the numeric "price" field and returns items under $50.00.

Query:  $.store.inventory[?(@.price >= 80 && @.inStock === true)].name
Result: ["Mechanical Keyboard", "4K Monitor"]
Explanation: Combines numeric threshold and boolean check using the logical AND (&&) operator.`,
            caption: 'Numeric range and compound boolean filtering.',
          },
        ],
      },
      {
        id: 'array-slices',
        heading: 'Array Slicing: Extracting Subsets by Position (jsonpath array slice notation)',
        paragraphs: [
          'In addition to property filters, jsonpath array slice notation allows extracting subsets of arrays using Python-style slice syntax: `[start:end:step]`.',
        ],
        codeExamples: [
          {
            title: 'Array Slice Examples',
            language: 'text',
            code: `Query:  $.store.inventory[0:2].name
Result: ["USB-C Cable", "Mechanical Keyboard"]
Explanation: Slices indices 0 up to (not including) 2, returning the first two items.

Query:  $.store.inventory[-1:].name
Result: ["4K Monitor"]
Explanation: Uses negative indexing to retrieve the last element of the array.`,
            caption: 'Verified array slice queries using jsonpath-plus index evaluator.',
          },
        ],
      },
      {
        id: 'practical-api-pipelines',
        heading: 'Practical Automation Pipelines: Postman, GitHub Actions & Kubernetes',
        paragraphs: [
          'JSONPath is supported natively across developer tools and cloud orchestration systems:',
        ],
        lists: [
          {
            type: 'bullet',
            items: [
              'Postman API Tests: Extract authentication tokens or assertion values with `pm.response.json()` and JSONPath expressions.',
              'GitHub Actions: Extract matrix values or outputs from workflow steps using `${{ fromJSON(steps.step_id.outputs.result).items[0] }}`.',
              'Kubernetes kubectl: Format cluster status directly using `kubectl get pods -o jsonpath="{.items[*].metadata.name}"`.',
              'AWS Step Functions: Map execution input and state outputs using JSONPath path filters.',
            ],
          },
        ],
      },
    ],
    primaryCta: {
      title: 'Test JSONPath Expressions Live in Your Browser',
      description: 'Run queries against custom payloads with real-time match highlighting, path reporting, and tabular result inspection.',
      buttonText: 'test a JSONPath query online',
      buttonUrl: '/jsonpath',
      badge: 'Interactive Evaluator',
      secondaryText: 'explore nested JSON data',
      secondaryUrl: '/json-viewer',
    },
    breadcrumbs: [
      { label: 'Guides', to: '/guides' },
      { label: 'JSONPath API Query Examples' },
    ],
    relatedGuides: [
      {
        slug: 'how-to-fix-common-json-syntax-errors',
        route: '/guides/how-to-fix-common-json-syntax-errors',
        title: 'How to Fix Common JSON Syntax Errors (RFC 8259 Guide)',
        description: 'Fix parse errors like trailing commas, single quotes, and position 0 tokens.',
        primaryKeyword: 'how to fix json syntax errors',
      },
      {
        slug: 'how-to-compare-json-objects-differing-key-order',
        route: '/guides/how-to-compare-json-objects-differing-key-order',
        title: 'How to Compare JSON Objects When Key Order Differs',
        description: 'Compare two JSON objects ignoring key order using semantic diffing and recursive sorting.',
        primaryKeyword: 'compare json objects ignore key order',
      },
    ],
    datePublished: '2026-10-23',
    dateModified: '2026-10-23',
    readTime: '6 min read',
  },
};
