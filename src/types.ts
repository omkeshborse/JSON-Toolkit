export type ActiveTab = 'jsonpath' | 'schema' | 'tree' | 'format';

export interface SampleDataset {
  id: string;
  name: string;
  category: string;
  description: string;
  data: any;
  defaultPathQuery?: string;
  suggestedSchema?: any;
}

export interface JsonPathMatch {
  path: string;
  value: any;
  parent?: any;
  parentProperty?: string | number;
  hasArrIndex?: boolean;
}

export interface JsonPathResult {
  matches: JsonPathMatch[];
  rawValues: any[];
  executionTimeMs: number;
  error?: string;
  query: string;
}

export interface SchemaValidationError {
  keyword: string;
  instancePath: string;
  schemaPath: string;
  message: string;
  params: Record<string, any>;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: SchemaValidationError[];
  evaluatedAt: number;
}

export interface SchemaGeneratorOptions {
  includeRequired: boolean;
  detectFormats: boolean;
  detectEnums: boolean;
  schemaDraft: 'draft-07' | '2020-12';
  title?: string;
  description?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
