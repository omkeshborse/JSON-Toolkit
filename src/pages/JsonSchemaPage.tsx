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
  Minimize2,
  Maximize2,
  Expand,
  Shrink,
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
  const [dataText, setDataText] = useState<string>(SAMPLE_DATA);
  const [schemaText, setSchemaText] = useState<string>(SAMPLE_SCHEMA);

  // Common Expand & Fullscreen UI mode
  const [workspaceMode, setWorkspaceMode] = useState<'normal' | 'expanded' | 'fullscreen'>('normal');

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

  const isFullscreen = workspaceMode === 'fullscreen';
  const isExpanded = workspaceMode === 'expanded';

  const toggleExpand = () => setWorkspaceMode((prev) => (prev === 'expanded' ? 'normal' : 'expanded'));
  const toggleFullscreen = () => setWorkspaceMode((prev) => (prev === 'fullscreen' ? 'normal' : 'fullscreen'));

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col w-full transition-all duration-200 ${
        isExpanded ? 'max-w-[96vw]' : 'max-w-7xl'
      }`}
    >
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
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
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

      {/* Workspace Control Bar with Expand/Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121620] border border-[#1A202C] rounded-xl mb-4 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            className="px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Validate Schema</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <button
              type="button"
              onClick={toggleExpand}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isExpanded
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-300 hover:text-white border-[#262D3D]'
              }`}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'Restore' : 'Expand'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
              isFullscreen
                ? 'bg-[#38BDF8] text-slate-950 hover:bg-[#38BDF8]/90'
                : 'bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D]'
            }`}
          >
            {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

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
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F43F5E] shrink-0" />
              <span className="font-semibold text-sm text-[#F43F5E]">
                Schema Validation Failed ({validationResult.errors.length} error{validationResult.errors.length > 1 ? 's' : ''})
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {validationResult.errors.map((err, idx) => (
                <div key={idx} className="text-xs font-mono bg-[#0B0D13]/60 p-2 rounded border border-[#F43F5E]/20 flex items-start gap-2">
                  <span className="text-[#F43F5E] font-semibold">{err.instancePath || '/'}:</span>
                  <span className="text-slate-300">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-side Equal-Height Editors Grid */}
      <div
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-[#0B0D13] w-screen h-screen overflow-hidden p-3 sm:p-4'
            : 'w-full mb-6'
        }
      >
        {isFullscreen && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#121620] border border-[#262D3D] rounded-xl text-xs mb-3 shrink-0">
            <span className="font-semibold text-white">JSON Schema Workspace (Side-by-Side View)</span>
            <button
              onClick={() => setWorkspaceMode('normal')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1A202C] hover:bg-[#262D3D] text-slate-200 hover:text-white border border-[#262D3D] font-medium"
            >
              <Shrink className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Exit Fullscreen</span>
            </button>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
            isFullscreen ? 'flex-1 min-h-0' : 'h-[clamp(440px,58vh,680px)]'
          }`}
        >
          {/* JSON Instance Payload */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              title="JSON Instance (Data)"
              value={dataText}
              onChange={setDataText}
              placeholder="Paste JSON data to validate against schema..."
              error={dataParse.error}
              heightClass="h-full"
            />
          </div>

          {/* JSON Schema Definition */}
          <div className="w-full h-full min-h-0 flex flex-col">
            <CodeEditor
              title="JSON Schema (Draft-07)"
              value={schemaText}
              onChange={setSchemaText}
              placeholder="Paste JSON Schema definition here..."
              error={schemaParse.error}
              heightClass="h-full"
            />
          </div>
        </div>
      </div>

      <SeoContentSection content={SEO_DATA_BY_PATH['/json-schema']} />
    </div>
  );
};
export default JsonSchemaPage;
