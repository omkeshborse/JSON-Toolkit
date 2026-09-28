import React from 'react';

interface SideBySideDiffProps {
  originalText: string;
  proposedText: string;
}

export const SideBySideDiff: React.FC<SideBySideDiffProps> = ({ originalText, proposedText }) => {
  const origLines = originalText.split('\n');
  const propLines = proposedText.split('\n');
  const maxLines = Math.max(origLines.length, propLines.length);

  const diffRows = [];
  for (let i = 0; i < maxLines; i++) {
    const oLine = origLines[i] ?? '';
    const pLine = propLines[i] ?? '';
    const isDifferent = oLine !== pLine;
    const isAdded = origLines[i] === undefined;
    const isRemoved = propLines[i] === undefined;

    diffRows.push({
      lineNum: i + 1,
      oLine,
      pLine,
      isDifferent,
      isAdded,
      isRemoved,
    });
  }

  return (
    <div className="flex-1 overflow-auto border border-[#262D3D] rounded-lg bg-[#0B0D13] font-mono text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1A202C] min-w-full">
        {/* Left Side: Original */}
        <div className="flex flex-col">
          <div className="sticky top-0 z-10 px-3 py-1.5 bg-[#121620] border-b border-[#1A202C] text-slate-400 font-sans font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500/70 inline-block"></span>
              Original JSON
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{origLines.length} lines</span>
          </div>
          <div className="py-2 overflow-x-auto">
            {diffRows.map((row) => (
              <div
                key={`orig-${row.lineNum}`}
                className={`flex items-start px-2 py-0.5 leading-5 ${
                  row.isDifferent
                    ? 'bg-rose-950/25 text-rose-200 border-l-2 border-rose-500'
                    : 'text-slate-300'
                }`}
              >
                <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-3 font-mono text-[11px]">
                  {row.lineNum}
                </span>
                <span className="whitespace-pre flex-1 font-mono break-all">
                  {row.oLine || (row.isDifferent ? <span className="text-slate-600 italic select-none">&empty;</span> : ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Proposed Fix */}
        <div className="flex flex-col">
          <div className="sticky top-0 z-10 px-3 py-1.5 bg-[#121620] border-b border-[#1A202C] text-slate-400 font-sans font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/70 inline-block"></span>
              Proposed Repair
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{propLines.length} lines</span>
          </div>
          <div className="py-2 overflow-x-auto">
            {diffRows.map((row) => (
              <div
                key={`prop-${row.lineNum}`}
                className={`flex items-start px-2 py-0.5 leading-5 ${
                  row.isDifferent
                    ? 'bg-emerald-950/25 text-emerald-200 border-l-2 border-emerald-500'
                    : 'text-slate-300'
                }`}
              >
                <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-3 font-mono text-[11px]">
                  {row.lineNum}
                </span>
                <span className="whitespace-pre flex-1 font-mono break-all">
                  {row.pLine || (row.isDifferent ? <span className="text-slate-600 italic select-none">&empty;</span> : ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
