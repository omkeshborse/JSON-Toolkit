import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Search, 
  Maximize2, 
  Minimize2, 
  Binary, 
  Hash, 
  Type, 
  ToggleLeft,
  Brackets,
  Check
} from 'lucide-react';

interface JsonTreeViewProps {
  data: any;
  isValidJson: boolean;
  onCopyText: (text: string, label: string) => void;
  onSendToJsonPath?: (pathQuery: string) => void;
}

export const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  isValidJson,
  onCopyText,
  onSendToJsonPath,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl min-h-[500px]">
      {/* Tree Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-200">Interactive JSON Tree Explorer</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Click any node to copy its JSONPath or test query
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search filter in keys/values */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keys or values..."
              className="bg-slate-950 border border-slate-700/80 rounded-lg pl-7 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-44 font-mono"
            />
          </div>

          <button
            onClick={() => setExpandAll(!expandAll)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {expandAll ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{expandAll ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Tree Body */}
      <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed selection:bg-blue-500/30">
        {!isValidJson || data === undefined ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Source JSON has syntax errors. Fix JSON to view Tree.
          </div>
        ) : (
          <TreeNode
            label="$"
            value={data}
            path="$"
            searchTerm={searchTerm}
            forceExpand={expandAll}
            onCopyText={onCopyText}
            onSendToJsonPath={onSendToJsonPath}
          />
        )}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  label: string;
  value: any;
  path: string;
  searchTerm: string;
  forceExpand: boolean;
  onCopyText: (text: string, label: string) => void;
  onSendToJsonPath?: (pathQuery: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  value,
  path,
  searchTerm,
  forceExpand,
  onCopyText,
  onSendToJsonPath,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync with forceExpand when it flips
  React.useEffect(() => {
    setIsExpanded(forceExpand);
  }, [forceExpand]);

  const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isComplex = isObject || isArray;

  const valueType = useMemo(() => {
    if (value === null) return 'null';
    if (isArray) return 'array';
    return typeof value;
  }, [value, isArray]);

  // Match search filter
  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (label.toLowerCase().includes(term)) return true;
    if (!isComplex && String(value).toLowerCase().includes(term)) return true;
    return false;
  }, [searchTerm, label, value, isComplex]);

  const childEntries = useMemo(() => {
    if (!isComplex) return [];
    if (isArray) {
      return value.map((val: any, idx: number) => ({
        key: `[${idx}]`,
        val,
        childPath: `${path}[${idx}]`,
      }));
    }
    return Object.entries(value).map(([k, val]) => ({
      key: k,
      val,
      childPath: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? `${path}.${k}` : `${path}['${k}']`,
    }));
  }, [isComplex, isArray, value, path]);

  const childCount = childEntries.length;

  return (
    <div className={`my-0.5 select-none ${matchesSearch ? 'opacity-100' : 'opacity-40'}`}>
      <div className="flex items-center gap-1.5 py-0.5 px-1.5 rounded hover:bg-slate-900/80 group text-slate-300">
        {/* Expand/Collapse Chevron */}
        {isComplex ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-500 hover:text-slate-200 cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Key Label */}
        <span className="text-slate-200 font-semibold">{label}:</span>

        {/* Value Preview or Type badge */}
        {isComplex ? (
          <span className="text-slate-500 text-[11px]">
            {isArray ? `Array(${childCount})` : `Object{${childCount}}`}
          </span>
        ) : (
          <ValueBadge value={value} type={valueType} />
        )}

        {/* Interactive Hover Actions */}
        <div className="hidden group-hover:flex items-center gap-1 ml-auto shrink-0">
          <button
            onClick={() => onCopyText(path, `JSONPath: ${path}`)}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy exact JSONPath to clipboard"
          >
            <Copy className="w-2.5 h-2.5" />
            <span>Copy Path</span>
          </button>

          {onSendToJsonPath && (
            <button
              onClick={() => onSendToJsonPath(path)}
              className="px-1.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-[10px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
              title="Open query in JSONPath Evaluator"
            >
              <Binary className="w-2.5 h-2.5" />
              <span>Eval Path</span>
            </button>
          )}

          {!isComplex && (
            <button
              onClick={() => onCopyText(String(value), `Value of ${label}`)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-sans transition-colors cursor-pointer"
              title="Copy raw value"
            >
              Copy Value
            </button>
          )}
        </div>
      </div>

      {/* Children list */}
      {isComplex && isExpanded && (
        <div className="pl-4 border-l border-slate-800/80 ml-2">
          {childEntries.map(({ key, val, childPath }) => (
            <TreeNode
              key={key}
              label={key}
              value={val}
              path={childPath}
              searchTerm={searchTerm}
              forceExpand={forceExpand}
              onCopyText={onCopyText}
              onSendToJsonPath={onSendToJsonPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ValueBadge: React.FC<{ value: any; type: string }> = ({ value, type }) => {
  if (type === 'string') {
    return (
      <span className="text-emerald-300 truncate max-w-sm">
        "{value}"
      </span>
    );
  }
  if (type === 'number') {
    return <span className="text-amber-300">{value}</span>;
  }
  if (type === 'boolean') {
    return <span className="text-purple-400 font-bold">{String(value)}</span>;
  }
  if (type === 'null') {
    return <span className="text-slate-500 italic">null</span>;
  }
  return <span className="text-slate-400">{String(value)}</span>;
};
