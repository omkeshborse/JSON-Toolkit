import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  ListTree, 
  Table as TableIcon, 
  FileCode, 
  HelpCircle, 
  History, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { JsonPathResult, JsonPathMatch } from '../types';
import { JSONPATH_PRESETS } from '../utils/jsonpath';

interface JsonPathViewProps {
  jsonString: string;
  parsedJson: any;
  isValidJson: boolean;
  query: string;
  setQuery: (q: string) => void;
  result: JsonPathResult;
  onCopyText: (text: string, label: string) => void;
}

type ResultDisplayMode = 'json' | 'nodes' | 'table';

export const JsonPathView: React.FC<JsonPathViewProps> = ({
  jsonString,
  parsedJson,
  isValidJson,
  query,
  setQuery,
  result,
  onCopyText,
}) => {
  const [displayMode, setDisplayMode] = useState<ResultDisplayMode>('json');
  const [showHelp, setShowHelp] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([
    '$.store.book[*]',
    '$..author',
    '$.store.book[?(@.price < 10)]'
  ]);
  const [selectedMatch, setSelectedMatch] = useState<JsonPathMatch | null>(null);

  const handleApplyQuery = (q: string) => {
    setQuery(q);
    if (q && !queryHistory.includes(q)) {
      setQueryHistory((prev) => [q, ...prev.slice(0, 7)]);
    }
  };

  // If results are array of objects, extract table columns
  const tableData = useMemo(() => {
    if (!result.rawValues || result.rawValues.length === 0) return null;
    const isArrayOfObjects = result.rawValues.every(
      (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
    );
    if (!isArrayOfObjects) return null;

    const columnKeys = Array.from(
      new Set(result.rawValues.flatMap((item) => Object.keys(item)))
    );

    return {
      columns: columnKeys,
      rows: result.rawValues,
    };
  }, [result.rawValues]);

  const formattedJsonOutput = useMemo(() => {
    if (result.error) return '';
    try {
      return JSON.stringify(result.rawValues, null, 2);
    } catch {
      return String(result.rawValues);
    }
  }, [result]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Query Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyQuery(query);
              }}
              placeholder="Enter JSONPath query, e.g. $.store.book[?(@.price < 10)] or $..author"
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-blue-500 rounded-lg pl-9 pr-24 py-2 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleApplyQuery(query)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluate</span>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              showHelp
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle JSONPath Syntax Cheat Sheet"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets & History */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs pt-0.5">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" /> Presets:
          </span>
          {JSONPATH_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleApplyQuery(preset.query)}
              className={`shrink-0 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-all cursor-pointer ${
                query === preset.query
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}

          {queryHistory.length > 0 && (
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2 shrink-0">
              <History className="w-3 h-3 text-slate-500" />
              <span className="text-slate-400 text-[11px]">Recent:</span>
              {queryHistory.slice(0, 3).map((hist, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyQuery(hist)}
                  className="shrink-0 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-mono truncate max-w-[120px]"
                  title={hist}
                >
                  {hist}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Syntax Cheat Sheet Drawer (if opened) */}
      {showHelp && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 text-xs shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-blue-400" />
              JSONPath Syntax Cheat Sheet & Standards
            </h4>
            <span className="text-slate-400 text-[11px]">Click any example to test it immediately</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-300">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="font-semibold text-blue-400 mb-1">Root & Operators</div>
              <ul className="space-y-1.5 text-[11px] font-mono">
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$')}>
                  <span className="text-amber-400">$</span> - Root object/element
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('@')}>
                  <span className="text-amber-400">@</span> - Current node in filter
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$.*')}>
                  <span className="text-amber-400">*</span> - Wildcard (all members)
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="font-semibold text-blue-400 mb-1">Descent & Drilldown</div>
              <ul className="space-y-1.5 text-[11px] font-mono">
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$.store.book')}>
                  <span className="text-amber-400">.prop</span> - Dot-child notation
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery("$['store']['book'] drop")}>
                  <span className="text-amber-400">['prop']</span> - Bracket notation
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$..author')}>
                  <span className="text-amber-400">..</span> - Recursive descent search
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="font-semibold text-blue-400 mb-1">Array Slices & Indexing</div>
              <ul className="space-y-1.5 text-[11px] font-mono">
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$.store.book[0]')}>
                  <span className="text-amber-400">[0]</span> - First array element
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$.store.book[-1:]')}>
                  <span className="text-amber-400">[-1:]</span> - Last array element
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$.store.book[0:2]')}>
                  <span className="text-amber-400">[0:2]</span> - Slice elements 0 to 2
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="font-semibold text-blue-400 mb-1">Filter Expressions</div>
              <ul className="space-y-1.5 text-[11px] font-mono">
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$.store.book[?(@.price < 10)]')}>
                  <span className="text-amber-400">[?(@.price &lt; 10)]</span> - Less than
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$..[?(@.isbn)]')}>
                  <span className="text-amber-400">[?(@.isbn)]</span> - Has property
                </li>
                <li className="cursor-pointer hover:text-blue-300" onClick={() => handleApplyQuery('$..[?(@.inStock === true)]')}>
                  <span className="text-amber-400">[?(@.inStock === true)]</span> - Boolean
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Results Container */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl min-h-[420px]">
        {/* Results Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/70 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Evaluation Results
            </span>

            {result.error ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[11px]">
                <AlertCircle className="w-3 h-3" /> Syntax Error
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-[11px] font-semibold">
                  {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
                </span>
                <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {result.executionTimeMs}ms
                </span>
              </div>
            )}
          </div>

          {/* Display Mode Switcher */}
          {!result.error && result.matches.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setDisplayMode('json')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  displayMode === 'json'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View as JSON Array"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => setDisplayMode('nodes')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  displayMode === 'nodes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View matched path details"
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Paths ({result.matches.length})</span>
              </button>

              {tableData && (
                <button
                  onClick={() => setDisplayMode('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    displayMode === 'table'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="View tabular representation"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              )}
            </div>
          )}

          {/* Copy Results Action */}
          {!result.error && result.matches.length > 0 && (
            <button
              onClick={() => onCopyText(formattedJsonOutput, 'Evaluated JSON results')}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy Matches</span>
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs">
          {result.error ? (
            <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-800/50 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>JSONPath Evaluation Error:</span>
              </div>
              <p className="text-slate-300 font-mono text-xs">{result.error}</p>
              <p className="text-slate-400 text-[11px] pt-1">
                Tip: Click on one of the presets above or check the Cheat Sheet for standard syntax.
              </p>
            </div>
          ) : result.matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-500">
              <Search className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No matches found for this JSONPath</p>
              <p className="text-xs text-slate-500 mt-1">
                Try running <code className="text-blue-400">$..*</code> or selecting a preset above.
              </p>
            </div>
          ) : displayMode === 'json' ? (
            <pre className="text-slate-200 leading-relaxed overflow-auto whitespace-pre selection:bg-blue-500/30">
              {formattedJsonOutput}
            </pre>
          ) : displayMode === 'nodes' ? (
            <div className="space-y-2.5">
              {result.matches.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 shrink-0">
                        #{idx + 1}
                      </span>
                      <code className="text-xs text-amber-300 font-semibold truncate" title={m.path}>
                        {m.path}
                      </code>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onCopyText(m.path, `Path: ${m.path}`)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                        title="Copy normalized path"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Copy Path
                      </button>

                      <button
                        onClick={() =>
                          onCopyText(
                            typeof m.value === 'object'
                              ? JSON.stringify(m.value, null, 2)
                              : String(m.value),
                            `Match #${idx + 1} Value`
                          )
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                        title="Copy value"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Copy Value
                      </button>
                    </div>
                  </div>

                  <pre className="text-slate-300 text-[11px] overflow-auto max-h-48 bg-slate-950 p-2 rounded border border-slate-800/60">
                    {typeof m.value === 'object' && m.value !== null
                      ? JSON.stringify(m.value, null, 2)
                      : String(m.value)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            tableData && (
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3 w-12 font-medium">#</th>
                      {tableData.columns.map((col) => (
                        <th key={col} className="py-2 px-3 font-medium text-slate-300 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tableData.rows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2 px-3 text-slate-500 font-mono">{i + 1}</td>
                        {tableData.columns.map((col) => {
                          const val = row[col];
                          const displayStr =
                            val === undefined
                              ? '-'
                              : typeof val === 'object'
                              ? JSON.stringify(val)
                              : String(val);
                          return (
                            <td
                              key={col}
                              className="py-2 px-3 text-slate-300 whitespace-nowrap max-w-xs truncate"
                              title={displayStr}
                            >
                              {displayStr}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
