import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  Sliders, 
  Copy, 
  Download, 
  Check, 
  Bug, 
  Settings2, 
  Eye, 
  Code,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { SchemaGeneratorOptions, SchemaValidationResult } from '../types';
import { generateJsonSchema } from '../utils/schemaGenerator';
import { validateJsonAgainstSchema } from '../utils/schemaValidator';

interface JsonSchemaViewProps {
  parsedJson: any;
  isValidJson: boolean;
  onCopyText: (text: string, label: string) => void;
  onUpdateJson?: (newJsonStr: string) => void;
}

export const JsonSchemaView: React.FC<JsonSchemaViewProps> = ({
  parsedJson,
  isValidJson,
  onCopyText,
  onUpdateJson,
}) => {
  const [schemaOptions, setSchemaOptions] = useState<SchemaGeneratorOptions>({
    includeRequired: true,
    detectFormats: true,
    detectEnums: true,
    schemaDraft: 'draft-07',
    title: 'GeneratedModel',
    description: 'Inferred schema from payload',
  });

  const [schemaText, setSchemaText] = useState<string>(() => {
    try {
      const generated = generateJsonSchema(parsedJson, {
        includeRequired: true,
        detectFormats: true,
        detectEnums: true,
        schemaDraft: 'draft-07',
        title: 'StoreSchema',
        description: 'Store schema specification',
      });
      return JSON.stringify(generated, null, 2);
    } catch {
      return '{}';
    }
  });

  const [activeSubTab, setActiveSubTab] = useState<'validate' | 'visualize' | 'settings'>('validate');

  // Parse current schema text
  const parsedSchema = useMemo(() => {
    try {
      return JSON.parse(schemaText);
    } catch {
      return null;
    }
  }, [schemaText]);

  // Live Ajv validation
  const validationResult: SchemaValidationResult = useMemo(() => {
    if (!isValidJson || parsedJson === undefined) {
      return {
        isValid: false,
        errors: [
          {
            keyword: 'input',
            instancePath: '',
            schemaPath: '',
            message: 'Source JSON document has syntax errors and cannot be validated.',
            params: {},
          },
        ],
        evaluatedAt: Date.now(),
      };
    }

    if (!parsedSchema) {
      return {
        isValid: false,
        errors: [
          {
            keyword: 'schema_syntax',
            instancePath: '',
            schemaPath: '',
            message: 'Schema document contains invalid JSON syntax.',
            params: {},
          },
        ],
        evaluatedAt: Date.now(),
      };
    }

    return validateJsonAgainstSchema(parsedJson, parsedSchema);
  }, [parsedJson, isValidJson, parsedSchema]);

  // Handler to infer/re-generate schema
  const handleRegenerateSchema = () => {
    if (!isValidJson || !parsedJson) return;
    try {
      const generated = generateJsonSchema(parsedJson, schemaOptions);
      setSchemaText(JSON.stringify(generated, null, 2));
      onCopyText('Schema re-generated from JSON', 'Status');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Inject intentional error to test schema validator
  const handleInjectTestError = () => {
    if (!onUpdateJson || !parsedJson) return;
    try {
      const mutated = JSON.parse(JSON.stringify(parsedJson));
      if (mutated.store?.book?.[0]) {
        // Change price to a string
        mutated.store.book[0].price = "NOT_A_NUMBER";
      } else if (Array.isArray(mutated)) {
        if (mutated[0]) mutated[0]._unexpected_field_violation = 999;
      } else if (typeof mutated === 'object') {
        mutated._violating_field = 12345;
      }
      onUpdateJson(JSON.stringify(mutated, null, 2));
    } catch {
      // ignore
    }
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([schemaText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* LEFT COLUMN: JSON Schema Editor & Generator Controls */}
      <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-semibold text-slate-200">JSON Schema (Draft-07 / 2020-12)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRegenerateSchema}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-sm cursor-pointer"
              title="Infer / Generate Schema from current JSON payload"
            >
              <Sparkles className="w-3 h-3" />
              <span>Infer from JSON</span>
            </button>

            <button
              onClick={() => onCopyText(schemaText, 'JSON Schema')}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy schema JSON"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownloadSchema}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Download schema.json"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Generator Settings Ribbon */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/40 border-b border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={schemaOptions.includeRequired}
                onChange={(e) => {
                  const opts = { ...schemaOptions, includeRequired: e.target.checked };
                  setSchemaOptions(opts);
                  if (isValidJson && parsedJson) {
                    setSchemaText(JSON.stringify(generateJsonSchema(parsedJson, opts), null, 2));
                  }
                }}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span>Required props</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={schemaOptions.detectFormats}
                onChange={(e) => {
                  const opts = { ...schemaOptions, detectFormats: e.target.checked };
                  setSchemaOptions(opts);
                  if (isValidJson && parsedJson) {
                    setSchemaText(JSON.stringify(generateJsonSchema(parsedJson, opts), null, 2));
                  }
                }}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span>Detect formats (email, date, uri)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={schemaOptions.detectEnums}
                onChange={(e) => {
                  const opts = { ...schemaOptions, detectEnums: e.target.checked };
                  setSchemaOptions(opts);
                  if (isValidJson && parsedJson) {
                    setSchemaText(JSON.stringify(generateJsonSchema(parsedJson, opts), null, 2));
                  }
                }}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span>Detect enums</span>
            </label>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-slate-500">Draft:</span>
            <select
              value={schemaOptions.schemaDraft}
              onChange={(e) => {
                const draft = e.target.value as 'draft-07' | '2020-12';
                const opts = { ...schemaOptions, schemaDraft: draft };
                setSchemaOptions(opts);
                if (isValidJson && parsedJson) {
                  setSchemaText(JSON.stringify(generateJsonSchema(parsedJson, opts), null, 2));
                }
              }}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
            >
              <option value="draft-07">Draft-07</option>
              <option value="2020-12">2020-12</option>
            </select>
          </div>
        </div>

        {/* Schema Code Editor */}
        <div className="flex-1 p-3 overflow-auto font-mono text-xs">
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[380px] bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-xs leading-relaxed selection:bg-blue-500/30"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Live Ajv Validation & Schema Diagnostics */}
      <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Live Ajv Validation
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onUpdateJson && (
              <button
                onClick={handleInjectTestError}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-amber-500/30 transition-colors cursor-pointer"
                title="Intentionally mutate payload with a type mismatch to test validator"
              >
                <Bug className="w-3 h-3" />
                <span>Simulate Error</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => setActiveSubTab('validate')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeSubTab === 'validate'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Validation Status
              </button>
              <button
                onClick={() => setActiveSubTab('visualize')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeSubTab === 'visualize'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Schema Model Tree
              </button>
            </div>
          </div>
        </div>

        {/* Validation Result Banner */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${
            validationResult.isValid
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {validationResult.isValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {validationResult.isValid
                  ? 'Schema Validation Passed'
                  : `Validation Failed (${validationResult.errors.length} ${
                      validationResult.errors.length === 1 ? 'error' : 'errors'
                    })`}
              </div>
              <div className="text-[11px] opacity-80">
                {validationResult.isValid
                  ? 'The JSON document conforms strictly to the specified JSON Schema specifications.'
                  : 'The JSON document contains values or missing required fields that violate the schema.'}
              </div>
            </div>
          </div>

          <span className="font-mono text-[10px] opacity-70">Ajv v8 Engine</span>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 overflow-auto text-xs">
          {activeSubTab === 'validate' ? (
            validationResult.isValid ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">All Constraints Satisfied</h4>
                  <p className="text-slate-400 text-xs mt-1 max-w-md">
                    All types, required object keys, string formats, and numerical bounds pass validation tests.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                  Checked against {parsedSchema?.title || 'Schema'} (
                  {Object.keys(parsedSchema?.properties || {}).length} root properties)
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300">Violations Breakdown:</div>
                {validationResult.errors.map((err, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-900/90 border border-rose-900/40 hover:border-rose-700/60 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase">
                          {err.keyword}
                        </span>
                        <code className="text-amber-300 font-mono text-xs font-semibold">
                          {err.instancePath || '/'}
                        </code>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">{err.schemaPath}</span>
                    </div>

                    <p className="text-slate-200 text-xs font-medium pl-1">{err.message}</p>

                    {err.params && Object.keys(err.params).length > 0 && (
                      <div className="bg-slate-950 p-1.5 rounded text-[11px] font-mono text-slate-400 border border-slate-800">
                        {JSON.stringify(err.params)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Visual Schema Explorer */
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                Schema Properties Structure ({parsedSchema?.title || 'Root'}):
              </div>
              {parsedSchema?.properties ? (
                <div className="space-y-2">
                  {Object.entries(parsedSchema.properties).map(([propName, propDef]: [string, any]) => {
                    const isRequired = parsedSchema.required?.includes(propName);
                    return (
                      <div
                        key={propName}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold text-slate-200 text-xs">{propName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">
                              {propDef.type || 'any'}
                            </span>
                            {propDef.format && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                                format: {propDef.format}
                              </span>
                            )}
                          </div>

                          {isRequired ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Optional</span>
                          )}
                        </div>

                        {propDef.type === 'object' && propDef.properties && (
                          <div className="pl-3 border-l-2 border-slate-800 mt-1 space-y-1 text-[11px] text-slate-400 font-mono">
                            {Object.keys(propDef.properties).map((childKey) => (
                              <div key={childKey} className="flex items-center gap-2">
                                <span>↳ {childKey}</span>
                                <span className="text-slate-500">
                                  ({propDef.properties[childKey]?.type || 'any'})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {propDef.type === 'array' && propDef.items && (
                          <div className="pl-3 border-l-2 border-slate-800 mt-1 text-[11px] text-slate-400 font-mono">
                            <span>↳ items: {propDef.items?.type || 'object'}</span>
                            {propDef.items?.properties && (
                              <span className="text-slate-500 ml-2">
                                [{Object.keys(propDef.items.properties).join(', ')}]
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 italic">No direct properties defined on this schema.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
