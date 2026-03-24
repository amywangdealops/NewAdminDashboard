import { TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
}

export function KpiCard({ label, value, subtitle, icon: Icon, trend }: KpiCardProps) {
  return (
    <div className="bg-white px-4 py-3.5 h-full flex flex-col justify-between min-h-[106px]">
      <div className="flex items-start justify-between mb-auto">
        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#f0efe9]">
          <Icon className="w-3 h-3 text-[#999891]" />
        </div>
        {trend !== undefined ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f0efe9] text-[#666] tabular-nums">
            {trend <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        ) : (
          <span className="h-5" />
        )}
      </div>
      <div className="mt-2">
        <div className="text-[18px] font-bold text-[#1a1a1a] tabular-nums leading-none">
          {value}
        </div>
        <div className="text-[10px] text-[#999891] mt-1.5 font-medium leading-tight">{label}</div>
        <div className="text-[10px] text-[#999891] mt-0.5 leading-tight min-h-[14px]">
          {subtitle || '\u00A0'}
        </div>
      </div>
    </div>
  );
}
