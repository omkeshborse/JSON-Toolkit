import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Code2, 
  Sparkles, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  Gauge,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { jsonToTypeScript } from '../utils/tsGenerator';
import { repairJson, JsonFixResult } from '../utils/jsonFixer';

interface JsonToolsViewProps {
  rawJson: string;
  parsedJson: any;
  isValidJson: boolean;
  onUpdateJson: (newJson: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const JsonToolsView: React.FC<JsonToolsViewProps> = ({
  rawJson,
  parsedJson,
  isValidJson,
  onUpdateJson,
  onCopyText,
}) => {
  const [indentStyle, setIndentStyle] = useState<'2' | '4' | 'tab' | 'minified'>('2');
  const [repairLog, setRepairLog] = useState<JsonFixResult | null>(null);

  // Compute TypeScript definition
  const tsCode = useMemo(() => {
    if (!isValidJson || parsedJson === undefined) {
      return '// Provide valid JSON to generate TypeScript interfaces';
    }
    try {
      return jsonToTypeScript(parsedJson, 'AppPayload');
    } catch {
      return '// Failed to generate TypeScript definitions';
    }
  }, [isValidJson, parsedJson]);

  // Compute detailed document statistics
  const metrics = useMemo(() => {
    if (!isValidJson || parsedJson === undefined) return null;

    let keyCount = 0;
    let maxDepth = 0;
    let arrayCount = 0;
    let objectCount = 0;
    let primitivesCount = 0;

    function walk(node: any, depth: number) {
      if (depth > maxDepth) maxDepth = depth;

      if (Array.isArray(node)) {
        arrayCount++;
        node.forEach((item) => walk(item, depth + 1));
      } else if (typeof node === 'object' && node !== null) {
        objectCount++;
        const keys = Object.keys(node);
        keyCount += keys.length;
        keys.forEach((k) => walk(node[k], depth + 1));
      } else {
        primitivesCount++;
      }
    }

    walk(parsedJson, 1);

    return {
      keyCount,
      maxDepth,
      arrayCount,
      objectCount,
      primitivesCount,
      byteSize: new Blob([rawJson]).size,
      lines: rawJson.split('\n').length,
    };
  }, [rawJson, parsedJson, isValidJson]);

  const handleFormat = (style: '2' | '4' | 'tab' | 'minified') => {
    if (!isValidJson || parsedJson === undefined) return;
    setIndentStyle(style);
    let formatted = '';
    if (style === '2') formatted = JSON.stringify(parsedJson, null, 2);
    else if (style === '4') formatted = JSON.stringify(parsedJson, null, 4);
    else if (style === 'tab') formatted = JSON.stringify(parsedJson, null, '\t');
    else if (style === 'minified') formatted = JSON.stringify(parsedJson);

    onUpdateJson(formatted);
    onCopyText(`Formatted as ${style === 'minified' ? 'Minified' : `${style} spaces`}`, 'Status');
  };

  const handleAutoRepair = () => {
    const result = repairJson(rawJson);
    setRepairLog(result);
    if (result.fixedJson) {
      onUpdateJson(result.fixedJson);
      onCopyText('Auto-repair executed', 'Status');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* LEFT COLUMN: Auto-Repair & Format Options */}
      <div className="flex flex-col gap-4">
        {/* Formatting controls card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Format & Layout Presets</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
            <button
              onClick={() => handleFormat('2')}
              className={`p-2 rounded-lg border text-center font-mono transition-all cursor-pointer ${
                indentStyle === '2'
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              2 Spaces
            </button>
            <button
              onClick={() => handleFormat('4')}
              className={`p-2 rounded-lg border text-center font-mono transition-all cursor-pointer ${
                indentStyle === '4'
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              4 Spaces
            </button>
            <button
              onClick={() => handleFormat('tab')}
              className={`p-2 rounded-lg border text-center font-mono transition-all cursor-pointer ${
                indentStyle === 'tab'
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Tabs (\t)
            </button>
            <button
              onClick={() => handleFormat('minified')}
              className={`p-2 rounded-lg border text-center font-mono transition-all cursor-pointer ${
                indentStyle === 'minified'
                  ? 'bg-blue-600 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Minified (1 Line)
            </button>
          </div>
        </div>

        {/* Smart Repair Tool Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Smart JSON Auto-Repair Engine</span>
            </div>

            <button
              onClick={handleAutoRepair}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Auto-Repair</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically fixes single quotes (<code className="text-amber-300">'key': 'val'</code>), unquoted keys (
            <code className="text-amber-300">key: 123</code>), trailing commas (<code className="text-amber-300">[1, 2,]</code>),
            Python primitives (<code className="text-amber-300">True, False, None</code>), and stripped JavaScript comments.
          </p>

          {repairLog && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                {repairLog.repaired ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span>Repair Diagnostics:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                {repairLog.fixesApplied.map((fix, idx) => (
                  <li key={idx} className="text-emerald-300">{fix}</li>
                ))}
              </ul>
              {repairLog.error && (
                <div className="text-rose-400 text-[11px] pt-1">{repairLog.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Structural Metrics */}
        {metrics && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-semibold text-slate-200">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <span>Document Topology & Metrics</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Keys</span>
                <span className="text-base font-bold text-slate-200 font-mono">{metrics.keyCount}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Max Depth</span>
                <span className="text-base font-bold text-slate-200 font-mono">{metrics.maxDepth}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Objects</span>
                <span className="text-base font-bold text-slate-200 font-mono">{metrics.objectCount}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Arrays</span>
                <span className="text-base font-bold text-slate-200 font-mono">{metrics.arrayCount}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Primitives</span>
                <span className="text-base font-bold text-slate-200 font-mono">{metrics.primitivesCount}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Byte Size</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {(metrics.byteSize / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: TypeScript Interface Generator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-200">TypeScript Interface Definitions</span>
          </div>

          <button
            onClick={() => onCopyText(tsCode, 'TypeScript interfaces')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Copy className="w-3 h-3 text-slate-400" />
            <span>Copy Types</span>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-blue-300 selection:bg-blue-500/30">
          <pre className="whitespace-pre">{tsCode}</pre>
        </div>
      </div>
    </div>
  );
};
