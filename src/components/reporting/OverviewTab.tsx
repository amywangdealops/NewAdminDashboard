import { CheckCircle2, Timer, Clock, XCircle, UserCheck, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../ui/chart';
import { KpiCard } from './KpiCard';
import { WEEKLY_TREND, APPROVAL_TIME_DISTRIBUTION, type TimePeriod, type KPI_DATA } from './reportingData';

interface OverviewTabProps {
  kpi: typeof KPI_DATA extends Record<string, infer V> ? V : never;
  timePeriod: TimePeriod;
}

const weeklyChartConfig: ChartConfig = {
  approvals: { label: 'Approvals', color: '#1a1a1a' },
};

const timeDistConfig: ChartConfig = {
  count: { label: 'Deals', color: '#1a1a1a' },
};

export function OverviewTab({ kpi, timePeriod }: OverviewTabProps) {
  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 border border-[#e2e0d8] rounded-lg overflow-hidden divide-x divide-[#e2e0d8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <KpiCard label="Total Approvals" value={kpi.totalApprovals} icon={CheckCircle2} trend={-3} />
        <KpiCard label="Avg. Approval Time" value={`${kpi.avgTime}h`} icon={Timer} trend={8} subtitle="Target: < 4h" />
        <KpiCard label="Pending Now" value={kpi.pending} icon={Clock} />
        <KpiCard label="Rejection Rate" value={`${kpi.rejectionRate}%`} icon={XCircle} trend={2} />
        <KpiCard label="VP/CFO Reviews" value={kpi.vpReviews + kpi.cfoReviews} icon={UserCheck} subtitle={`${kpi.vpReviews} VP · ${kpi.cfoReviews} CFO`} />
        <KpiCard label="Rules Active" value={47} icon={Shield} subtitle="3 paused" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Approval Trend */}
        <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-4 pt-3.5 pb-2 flex items-center justify-between border-b border-[#f0efe9]">
            <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Weekly Approval Volume</h3>
            <span className="text-[10px] text-[#999891]">Last 6 weeks</span>
          </div>
          <div className="px-2 pb-3">
            <ChartContainer config={weeklyChartConfig} className="h-[200px] w-full aspect-auto">
              <BarChart data={WEEKLY_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e0d8" />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tickMargin={8}
                  fontFamily="monospace"
                />
                <YAxis tickLine={false} axisLine={false} fontSize={10} width={36} fontFamily="monospace" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="approvals" radius={[3, 3, 0, 0]} maxBarSize={40}>
                  {WEEKLY_TREND.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx === WEEKLY_TREND.length - 1 ? '#d4d3cd' : '#1a1a1a'}
                      stroke={idx === WEEKLY_TREND.length - 1 ? '#1a1a1a' : 'none'}
                      strokeWidth={idx === WEEKLY_TREND.length - 1 ? 1 : 0}
                      strokeDasharray={idx === WEEKLY_TREND.length - 1 ? '3 2' : undefined}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-1 px-3 flex items-center justify-between text-[10px] text-[#999891]">
              <span>Avg. weekly: <span className="font-semibold text-[#1a1a1a] tabular-nums">78</span></span>
              <span className="text-[#1a1a1a]">Current week (partial)</span>
            </div>
          </div>
        </div>

        {/* Approval Time Distribution */}
        <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-4 pt-3.5 pb-2 flex items-center justify-between border-b border-[#f0efe9]">
            <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Approval Time Distribution</h3>
            <span className="text-[10px] text-[#999891]">{timePeriod}</span>
          </div>
          <div className="px-2 pb-3">
            <ChartContainer config={timeDistConfig} className="h-[200px] w-full aspect-auto">
              <BarChart
                data={APPROVAL_TIME_DISTRIBUTION}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 0, left: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e0d8" />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} fontFamily="monospace" />
                <YAxis
                  dataKey="bucket"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  width={80}
                  fontFamily="monospace"
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, _name, item) => (
                    <span className="font-medium tabular-nums">{value} deals ({item.payload.pct}%)</span>
                  )}
                />
                <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={18} fill="#1a1a1a">
                  {APPROVAL_TIME_DISTRIBUTION.map((d, idx) => {
                    const opacity = 1 - (idx * 0.12);
                    return <Cell key={idx} fill={`rgba(26,26,26,${opacity})`} />;
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-1 px-3 flex items-center gap-1.5 text-[10px] text-[#999891]">
              <span>72% within 4h (SLA target: 80%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-3 border-b border-[#f0efe9]">
          <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Key Insights — {timePeriod}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-[#f0efe9]">
          <div className="px-4 py-3 border-l-[3px] border-l-[#1a1a1a]">
            <span className="text-[11px] font-semibold text-[#1a1a1a]">VP Approval is #1 bottleneck</span>
            <p className="text-[10px] text-[#999891] mt-0.5">Avg 8.4h — 2x slower than SLA. 6 pending.</p>
          </div>
          <div className="px-4 py-3">
            <span className="text-[11px] font-semibold text-[#1a1a1a]">Multi-Year {'>'} 3yr: 22% rejection</span>
            <p className="text-[10px] text-[#999891] mt-0.5">Consider lowering to 2yr threshold.</p>
          </div>
          <div className="px-4 py-3">
            <span className="text-[11px] font-semibold text-[#1a1a1a]">Deal Desk turnaround +5%</span>
            <p className="text-[10px] text-[#999891] mt-0.5">Down to 0.8d. Yi-an Zhang leads at 94% SLA.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
