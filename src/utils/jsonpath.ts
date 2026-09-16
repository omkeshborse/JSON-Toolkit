import { JSONPath } from 'jsonpath-plus';
import { JsonPathMatch, JsonPathResult } from '../types';

export function evaluateJsonPath(query: string, data: any): JsonPathResult {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      matches: [],
      rawValues: [],
      executionTimeMs: 0,
      query: trimmedQuery,
    };
  }

  const startTime = performance.now();

  try {
    const rawMatches = JSONPath({
      path: trimmedQuery,
      json: data,
      resultType: 'all',
    });

    const endTime = performance.now();
    const executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

    const matches: JsonPathMatch[] = (rawMatches || []).map((item: any) => ({
      path: item.path || '',
      value: item.value,
      parent: item.parent,
      parentProperty: item.parentProperty,
      hasArrIndex: typeof item.parentProperty === 'number',
    }));

    const rawValues = matches.map((m) => m.value);

    return {
      matches,
      rawValues,
      executionTimeMs,
      query: trimmedQuery,
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      matches: [],
      rawValues: [],
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      error: err?.message || 'Invalid JSONPath expression',
      query: trimmedQuery,
    };
  }
}

export interface JsonPathPreset {
  label: string;
  query: string;
  category: string;
  description: string;
}

export const JSONPATH_PRESETS: JsonPathPreset[] = [
  {
    label: 'All Books',
    query: '$.store.book[*]',
    category: 'Wildcards',
    description: 'Select all elements in the book array'
  },
  {
    label: 'All Authors ($..author)',
    query: '$..author',
    category: 'Recursive Descent',
    description: 'Find all authors anywhere in the document'
  },
  {
    label: 'Books under $10',
    query: '$.store.book[?(@.price < 10)]',
    category: 'Filter Expressions',
    description: 'Filter array items by conditional expression'
  },
  {
    label: 'Last Book',
    query: '$.store.book[-1:]',
    category: 'Slices & Indexes',
    description: 'Get the last element of the book array'
  },
  {
    label: 'First 2 Books',
    query: '$.store.book[0,1]',
    category: 'Slices & Indexes',
    description: 'Extract elements at specific indices'
  },
  {
    label: 'All Prices Everywhere',
    query: '$..price',
    category: 'Recursive Descent',
    description: 'Extract every "price" property regardless of depth'
  },
  {
    label: 'All In-Stock Items',
    query: '$..[?(@.inStock === true)]',
    category: 'Filter Expressions',
    description: 'Filter all objects where inStock is true'
  },
  {
    label: 'Store Coordinates',
    query: '$.store.location.coordinates',
    category: 'Dot Notation',
    description: 'Direct child path drill-down'
  }
];
