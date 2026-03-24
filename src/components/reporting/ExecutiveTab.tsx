import { UserCheck, Users, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '../ui/chart';
import { KpiCard } from './KpiCard';
import { EXECUTIVE_REVIEWS, EXEC_WEEKLY_VOLUME, type TimePeriod, type KPI_DATA } from './reportingData';

interface ExecutiveTabProps {
  kpi: typeof KPI_DATA extends Record<string, infer V> ? V : never;
  timePeriod: TimePeriod;
}

const execChartConfig: ChartConfig = {
  vp: { label: 'VP of Sales', color: '#1a1a1a' },
  cfo: { label: 'CFO', color: '#999891' },
};

export function ExecutiveTab({ kpi, timePeriod }: ExecutiveTabProps) {
  const totalDeals = kpi.totalApprovals;
  const execDeals = kpi.vpReviews + kpi.cfoReviews;
  const execPct = ((execDeals / totalDeals) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-[#e2e0d8] rounded-lg overflow-hidden divide-x divide-[#e2e0d8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <KpiCard
          label="VP of Sales Reviews"
          value={kpi.vpReviews}
          icon={UserCheck}
          subtitle={`${((kpi.vpReviews / totalDeals) * 100).toFixed(1)}% of deals`}
        />
        <KpiCard
          label="CFO Reviews"
          value={kpi.cfoReviews}
          icon={UserCheck}
          subtitle={`${((kpi.cfoReviews / totalDeals) * 100).toFixed(1)}% of deals`}
        />
        <KpiCard
          label="Total Executive"
          value={execDeals}
          icon={Users}
          subtitle={`${execPct}% of deals`}
        />
        <KpiCard
          label="Exec Avg. Time"
          value="9.8h"
          icon={Timer}
          trend={5}
          subtitle="Target: < 8h"
        />
      </div>

      {/* Executive review table */}
      <div>
        <div className="mb-3">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Executive review breakdown</h3>
          <p className="text-[10px] text-[#999891] mt-0.5">{timePeriod} · {EXECUTIVE_REVIEWS.length} levels</p>
        </div>
        <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e2e0d8] bg-[#fafaf8]">
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Level</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Deals</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">%</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Avg Size</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Avg Time</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Top Trigger</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0efe9]">
              {EXECUTIVE_REVIEWS.map(r => (
                <tr key={r.level} className="hover:bg-[#fafaf8] transition-colors">
                  <td className="px-4 py-2.5 text-[11px] font-semibold text-[#1a1a1a]">{r.level}</td>
                  <td className="px-4 py-2.5 text-[11px] font-bold tabular-nums text-[#1a1a1a]">{r.deals}</td>
                  <td className="px-4 py-2.5 text-[11px] tabular-nums text-[#999891]">{r.pctOfTotal}%</td>
                  <td className="px-4 py-2.5 text-[11px] tabular-nums text-[#1a1a1a]">{r.avgDealSize}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-bold tabular-nums ${
                      parseFloat(r.avgTime) > 8 ? 'text-[#1a1a1a]' : 'text-[#999891]'
                    }`}>
                      {r.avgTime}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-[#666]">{r.topTrigger}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                      r.approvalRate < 80 ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0efe9] text-[#1a1a1a]'
                    }`}>
                      {r.approvalRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between border-b border-[#f0efe9]">
          <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Executive Review Volume by Week</h3>
          <span className="text-[10px] text-[#999891]">Last 6 weeks</span>
        </div>
        <div className="px-2 pb-3">
          <ChartContainer config={execChartConfig} className="h-[200px] w-full aspect-auto">
            <BarChart data={EXEC_WEEKLY_VOLUME} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e0d8" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={10} tickMargin={8} fontFamily="monospace" />
              <YAxis tickLine={false} axisLine={false} fontSize={10} width={36} fontFamily="monospace" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="vp" stackId="exec" fill="#1a1a1a" radius={[0, 0, 0, 0]} maxBarSize={36} />
              <Bar dataKey="cfo" stackId="exec" fill="#c9c7be" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
