import React, { useState, useMemo } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { ToolHeader } from '../components/ToolHeader';
import { CodeEditor } from '../components/CodeEditor';
import { SeoContentSection } from '../components/SeoContentSection';
import { SEO_DATA_BY_PATH } from '../data/seoContent';
import { validateJsonAgainstSchema } from '../utils/schemaValidator';
import {
  FileCode2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Trash2,
  Play,
  Layers,
  Copy,
  Info,
} from 'lucide-react';

const SAMPLE_DATA = `{
  "id": 1042,
  "name": "Standard Laptop Pro",
  "price": 1299.99,
  "inStock": true,
  "tags": ["electronics", "computers"],
  "contact": {
    "email": "support@example.com"
  }
}`;

const SAMPLE_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 3 },
    "price": { "type": "number", "minimum": 0 },
    "inStock": { "type": "boolean" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "contact": {
      "type": "object",
      "properties": {
        "email": { "type": "string", "format": "email" }
      },
      "required": ["email"]
    }
  },
  "required": ["id", "name", "price"]
}`;

export const JsonSchemaPage: React.FC<{ onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast,
}) => {
  const [dataText, setDataText] = useState<string>('');
  const [schemaText, setSchemaText] = useState<string>('');

  // Parse state
  const dataParse = useMemo(() => {
    if (!dataText.trim()) return { data: null, isValid: false, error: null };
    try {
      return { data: JSON.parse(dataText), isValid: true, error: null };
    } catch (err: any) {
      return { data: null, isValid: false, error: err?.message || 'Invalid JSON Data syntax' };
    }
  }, [dataText]);

  const schemaParse = useMemo(() => {
    if (!schemaText.trim()) return { schema: null, isValid: false, error: null };
    try {
      return { schema: JSON.parse(schemaText), isValid: true, error: null };
    } catch (err: any) {
      return { schema: null, isValid: false, error: err?.message || 'Invalid JSON Schema syntax' };
    }
  }, [schemaText]);

  // Ajv Schema Validation
  const validationResult = useMemo(() => {
    if (!dataParse.isValid || !schemaParse.isValid || dataParse.data === null || schemaParse.schema === null) {
      return null;
    }
    return validateJsonAgainstSchema(dataParse.data, schemaParse.schema);
  }, [dataParse, schemaParse]);

  const handleValidate = () => {
    if (!validationResult) {
      onShowToast('Resolve syntax errors before validating schema', 'error');
      return;
    }
    if (validationResult.isValid) {
      onShowToast('Validation Passed: Data strictly conforms to JSON Schema', 'success');
    } else {
      onShowToast(`Schema validation failed with ${validationResult.errors.length} error(s)`, 'error');
    }
  };

  const handleResetSample = () => {
    setDataText(SAMPLE_DATA);
    setSchemaText(SAMPLE_SCHEMA);
    onShowToast('Loaded sample dataset and schema', 'info');
  };

  const handleClear = () => {
    setDataText('');
    setSchemaText('');
    onShowToast('Cleared editors', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full">
      <Breadcrumb items={[{ label: 'JSON Schema' }]} />

      <ToolHeader
        title="JSON Schema Validator"
        description="Validate JSON instance payloads against standard JSON Schema specifications using the Ajv validator."
        icon={FileCode2}
        badge="Ajv Engine"
        actions={
          <>
            <button
              onClick={handleValidate}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Validate Schema</span>
            </button>
            <button
              onClick={handleResetSample}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121620] hover:bg-[#1A202C] text-slate-300 border border-[#262D3D] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </>
        }
      />

      {/* Validation Result Status Banner */}
      <div className="mb-4">
        {validationResult && validationResult.isValid && (
          <div className="p-3.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 flex items-center gap-3 text-white">
            <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-[#34D399]">Schema Validation Successful:</span> The payload strictly satisfies all rules defined in the JSON Schema.
            </div>
          </div>
        )}

        {validationResult && !validationResult.isValid && (
          <div className="p-4 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F43F5E]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Schema Validation Failed ({validationResult.errors.length} violations found):</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {validationResult.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-[#0B0D13]/80 border border-[#F43F5E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-white font-semibold">{err.instancePath || 'root'}</span>
                    <span className="text-slate-400 font-sans ml-2">{err.message}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#F43F5E]/20 text-[#F43F5E]">
                      {err.keyword}
                    </span>
                    <span className="text-slate-500 font-mono">{err.schemaPath}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(Boolean(dataParse.error) || Boolean(schemaParse.error)) && (
          <div className="p-3 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs text-[#FBBF24] flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              {dataParse.error ? `Data syntax error: ${dataParse.error}` : ''}
              {dataParse.error && schemaParse.error ? ' | ' : ''}
              {schemaParse.error ? `Schema syntax error: ${schemaParse.error}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Editors Grid: Left Data, Right Schema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <div className="flex flex-col min-h-[460px]">
          <CodeEditor
            title="JSON Data (Instance Payload)"
            value={dataText}
            onChange={setDataText}
            placeholder="Paste JSON data to validate..."
            error={dataParse.error}
          />
        </div>

        <div className="flex flex-col min-h-[460px]">
          <CodeEditor
            title="JSON Schema Definition"
            value={schemaText}
            onChange={setSchemaText}
            placeholder="Paste JSON Schema (Draft-07 / 2020-12)..."
            error={schemaParse.error}
          />
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-schema']} />
    </div>
  );
};
