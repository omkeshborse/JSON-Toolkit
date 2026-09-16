import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  actions?: React.ReactNode;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  title,
  description,
  icon: Icon,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1A202C]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#121620] border border-[#262D3D] flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#121620] text-[#38BDF8] border border-[#262D3D]">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};
