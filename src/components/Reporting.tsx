import {
  BarChart3, Search, Download, Clock, TrendingUp, TrendingDown,
  Users, AlertTriangle, CheckCircle2, Timer, ArrowUpRight,
  ArrowDownRight, Filter, ChevronDown, UserCheck, Shield,
  Zap, Target, Activity, XCircle, ArrowRight, Info
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const TIME_PERIODS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Quarter', 'This Year'] as const;

const KPI_DATA = {
  'Last 7 Days':   { totalApprovals: 87,  avgTime: 3.2, pending: 14, rejectionRate: 8.0, vpReviews: 11, cfoReviews: 3 },
  'Last 30 Days':  { totalApprovals: 342, avgTime: 4.1, pending: 23, rejectionRate: 9.4, vpReviews: 48, cfoReviews: 12 },
  'Last 90 Days':  { totalApprovals: 1024,avgTime: 4.4, pending: 31, rejectionRate: 10.2,vpReviews: 139, cfoReviews: 38 },
  'This Quarter':  { totalApprovals: 891, avgTime: 4.3, pending: 28, rejectionRate: 9.8, vpReviews: 124, cfoReviews: 34 },
  'This Year':     { totalApprovals: 2847,avgTime: 4.6, pending: 23, rejectionRate: 11.1,vpReviews: 412, cfoReviews: 108 },
};

const BOTTLENECK_STAGES = [
  { stage: 'Deal Desk Review',       avgDays: 0.8, dealCount: 156, pctOfTotal: 46, trend: -5,  color: '#22c55e' },
  { stage: 'VP of Sales Approval',   avgDays: 2.4, dealCount: 48,  pctOfTotal: 14, trend: 12,  color: '#ef4444' },
  { stage: 'Finance / CFO Review',   avgDays: 3.1, dealCount: 34,  pctOfTotal: 10, trend: 8,   color: '#ef4444' },
  { stage: 'Legal Review',           avgDays: 1.9, dealCount: 22,  pctOfTotal: 6,  trend: -2,  color: '#f59e0b' },
  { stage: 'Head of Mid-Market',     avgDays: 1.5, dealCount: 41,  pctOfTotal: 12, trend: 3,   color: '#f59e0b' },
  { stage: 'L2 Escalation',          avgDays: 1.2, dealCount: 41,  pctOfTotal: 12, trend: -1,  color: '#22c55e' },
];

const RULE_TRIGGER_DATA = [
  { rule: 'Payment Terms → Deal Desk',             count: 234, pct: 22, avgTime: '2.1h', rejRate: 4,  category: 'terms' },
  { rule: 'Billing Frequency Change → Deal Desk',  count: 189, pct: 18, avgTime: '1.8h', rejRate: 3,  category: 'terms' },
  { rule: 'Discount > 20% → L2 Approval',          count: 167, pct: 16, avgTime: '3.2h', rejRate: 12, category: 'pricing' },
  { rule: 'Custom Product → L2',                    count: 156, pct: 15, avgTime: '4.6h', rejRate: 9,  category: 'custom' },
  { rule: 'Price Lock → VP of Sales',               count: 98,  pct: 9,  avgTime: '8.4h', rejRate: 18, category: 'pricing' },
  { rule: 'ACV > $200K → VP Approval',              count: 72,  pct: 7,  avgTime: '6.2h', rejRate: 7,  category: 'pricing' },
  { rule: 'Net 90+ Terms → Finance',                count: 54,  pct: 5,  avgTime: '5.8h', rejRate: 15, category: 'terms' },
  { rule: 'Multi-Year > 3yr → CFO',                 count: 38,  pct: 4,  avgTime: '12.1h',rejRate: 22, category: 'terms' },
  { rule: 'Non-Standard Entity → Legal',            count: 31,  pct: 3,  avgTime: '9.2h', rejRate: 6,  category: 'custom' },
  { rule: 'Expansion – Billing Mismatch → Deal Desk', count: 18, pct: 1, avgTime: '3.4h', rejRate: 5, category: 'custom' },
];

const APPROVER_PERFORMANCE = [
  { name: 'Yi-an Zhang',      group: 'Deal Desk',         avgTime: '1.4h', approvals: 142, pending: 3,  rejections: 6,  sla: 94, avatar: 'YZ' },
  { name: 'Spyri Karasavva',  group: 'Deal Desk',         avgTime: '2.2h', approvals: 128, pending: 5,  rejections: 8,  sla: 87, avatar: 'SK' },
  { name: 'Amy Wang',         group: 'Finance Team',      avgTime: '3.8h', approvals: 64,  pending: 2,  rejections: 4,  sla: 78, avatar: 'AW' },
  { name: 'Miles Zimmerman',  group: 'Finance Team / L2', avgTime: '5.2h', approvals: 96,  pending: 8,  rejections: 11, sla: 68, avatar: 'MZ' },
  { name: 'Danek Li',         group: 'VP of Sales',       avgTime: '8.4h', approvals: 48,  pending: 6,  rejections: 9,  sla: 52, avatar: 'DL' },
  { name: 'Ankitr Wadhina',   group: 'Head of Mid-Market',avgTime: '6.1h', approvals: 41,  pending: 4,  rejections: 5,  sla: 61, avatar: 'AK' },
];

const EXECUTIVE_REVIEWS = [
  { level: 'VP of Sales',  deals: 48,  pctOfTotal: 14.0, avgDealSize: '$187K', avgTime: '8.4h', topTrigger: 'Price Lock > 12mo',        approvalRate: 81 },
  { level: 'CFO',          deals: 12,  pctOfTotal: 3.5,  avgDealSize: '$520K', avgTime: '12.1h',topTrigger: 'Multi-Year > 3yr',          approvalRate: 75 },
  { level: 'Head of Mid-Market', deals: 41, pctOfTotal: 12.0, avgDealSize: '$95K', avgTime: '6.1h', topTrigger: 'Non-Standard Terms', approvalRate: 88 },
  { level: 'Legal',        deals: 22,  pctOfTotal: 6.4,  avgDealSize: '$245K', avgTime: '9.2h', topTrigger: 'Non-Standard Entity',       approvalRate: 91 },
];

const THRESHOLD_IMPACT = [
  { threshold: 'Discount > 20%',      currentTriggers: 167, ifLowered: { label: '> 15%', triggers: 241, delta: '+44%' }, ifRaised: { label: '> 25%', triggers: 98,  delta: '-41%' }, avgDealImpact: '$12K', recommendation: 'Current threshold well-balanced' },
  { threshold: 'ACV > $200K',         currentTriggers: 72,  ifLowered: { label: '> $150K', triggers: 118, delta: '+64%' }, ifRaised: { label: '> $300K', triggers: 31,  delta: '-57%' }, avgDealImpact: '$47K', recommendation: 'Consider raising — low rejection rate (7%)' },
  { threshold: 'Payment Terms Net 90+',currentTriggers: 54,  ifLowered: { label: 'Net 60+', triggers: 142, delta: '+163%' }, ifRaised: { label: 'Net 120+', triggers: 12, delta: '-78%' }, avgDealImpact: '$8K',  recommendation: 'Keep current — high rejection rate (15%)' },
  { threshold: 'Multi-Year > 3yr',    currentTriggers: 38,  ifLowered: { label: '> 2yr', triggers: 89, delta: '+134%' }, ifRaised: { label: '> 4yr', triggers: 11,  delta: '-71%' }, avgDealImpact: '$62K', recommendation: 'Consider lowering — CFO rejects 22%' },
  { threshold: 'Price Lock > 12mo',   currentTriggers: 98,  ifLowered: { label: '> 6mo', triggers: 187, delta: '+91%' }, ifRaised: { label: '> 18mo', triggers: 42,  delta: '-57%' }, avgDealImpact: '$23K', recommendation: 'Current threshold appropriate' },
];

const WEEKLY_TREND = [
  { week: 'Jan 6',  approvals: 78,  avgTime: 4.8, rejections: 9 },
  { week: 'Jan 13', approvals: 82,  avgTime: 4.5, rejections: 7 },
  { week: 'Jan 20', approvals: 91,  avgTime: 4.2, rejections: 10 },
  { week: 'Jan 27', approvals: 85,  avgTime: 4.6, rejections: 8 },
  { week: 'Feb 3',  approvals: 87,  avgTime: 4.1, rejections: 7 },
  { week: 'Feb 10', approvals: 42,  avgTime: 3.2, rejections: 3 },
];

const APPROVAL_TIME_DISTRIBUTION = [
  { bucket: '< 1 hour',     count: 68,  pct: 20, color: '#22c55e' },
  { bucket: '1 – 2 hours',  count: 85,  pct: 25, color: '#22c55e' },
  { bucket: '2 – 4 hours',  count: 92,  pct: 27, color: '#3b82f6' },
  { bucket: '4 – 8 hours',  count: 58,  pct: 17, color: '#f59e0b' },
  { bucket: '8 – 24 hours', count: 27,  pct: 8,  color: '#ef4444' },
  { bucket: '> 24 hours',   count: 12,  pct: 3,  color: '#dc2626' },
];

type ReportTab = 'overview' | 'bottlenecks' | 'rules' | 'executive' | 'thresholds';

const TABS: { key: ReportTab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'overview',    label: 'Overview',            icon: BarChart3 },
  { key: 'bottlenecks', label: 'Bottlenecks',         icon: AlertTriangle },
  { key: 'rules',       label: 'Rules & Triggers',    icon: Zap },
  { key: 'executive',   label: 'Executive Reviews',   icon: UserCheck },
  { key: 'thresholds',  label: 'Threshold Impact',    icon: Target },
];

export function Reporting() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [timePeriod, setTimePeriod] = useState<typeof TIME_PERIODS[number]>('Last 30 Days');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const kpi = KPI_DATA[timePeriod];

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return RULE_TRIGGER_DATA;
    const q = searchQuery.toLowerCase();
    return RULE_TRIGGER_DATA.filter(r => r.rule.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#111827] tracking-tight">Reporting</h1>
            <p className="text-[#9ca3af] text-[12px] mt-0.5">
              Approval performance, bottlenecks, and trigger impact analysis
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Time Period Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTimePicker(!showTimePicker)}
                className="h-8 px-2.5 border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[#374151] text-[12px] font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
              >
                <Clock className="w-3.5 h-3.5 text-[#9ca3af]" />
                {timePeriod}
                <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
              </button>
              {showTimePicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTimePicker(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                    {TIME_PERIODS.map(p => (
                      <button
                        key={p}
                        onClick={() => { setTimePeriod(p); setShowTimePicker(false); }}
                        className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f9fafb] transition-colors ${p === timePeriod ? 'bg-[#4262FF]/5 text-[#4262FF] font-medium' : 'text-[#374151]'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] focus:bg-white text-[12px] transition-all placeholder:text-[#9ca3af]"
              />
            </div>
            <button
              onClick={handleExport}
              className="h-8 px-2.5 border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[#374151] text-[12px] font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
            >
              <Download className="w-3.5 h-3.5 text-[#9ca3af]" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Sub-tab nav */}
      <div className="border-b border-[#e5e7eb] bg-white px-6">
        <nav className="flex gap-0 -mb-px" role="tablist">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3 py-2 text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#4262FF] text-[#4262FF]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#374151] hover:border-[#e5e7eb]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && <OverviewTab kpi={kpi} timePeriod={timePeriod} />}
        {activeTab === 'bottlenecks' && <BottlenecksTab />}
        {activeTab === 'rules' && <RulesTab filteredRules={filteredRules} />}
        {activeTab === 'executive' && <ExecutiveTab kpi={kpi} timePeriod={timePeriod} />}
        {activeTab === 'thresholds' && <ThresholdsTab />}
      </div>
    </div>
  );
}

function KpiCard({ label, value, subtitle, icon: Icon, trend, trendLabel, color }: {
  label: string; value: string | number; subtitle?: string;
  icon: typeof BarChart3; trend?: number; trendLabel?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-3.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow">
      <div className="flex items-start justify-between mb-1.5">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            trend <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend <= 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-[18px] font-bold text-[#111827] tabular-nums leading-tight">{value}</div>
      <div className="text-[10px] text-[#9ca3af] mt-0.5">{label}</div>
      {subtitle && <div className="text-[10px] text-[#9ca3af] mt-0.5 italic">{subtitle}</div>}
    </div>
  );
}

function OverviewTab({ kpi, timePeriod }: { kpi: typeof KPI_DATA['Last 30 Days']; timePeriod: string }) {
  return (
    <div className="space-y-4">
      {/* KPI Cards - responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Total Approvals" value={kpi.totalApprovals} icon={CheckCircle2} trend={-3} color="#22c55e" />
        <KpiCard label="Avg. Approval Time" value={`${kpi.avgTime}h`} icon={Timer} trend={8} color="#3b82f6" subtitle="Target: < 4h" />
        <KpiCard label="Pending Now" value={kpi.pending} icon={Clock} color="#f59e0b" />
        <KpiCard label="Rejection Rate" value={`${kpi.rejectionRate}%`} icon={XCircle} trend={2} color="#ef4444" />
        <KpiCard label="VP/CFO Reviews" value={kpi.vpReviews + kpi.cfoReviews} icon={UserCheck} color="#8b5cf6" subtitle={`${kpi.vpReviews} VP · ${kpi.cfoReviews} CFO`} />
        <KpiCard label="Rules Active" value={47} icon={Shield} color="#4262FF" subtitle="3 paused" />
      </div>

      {/* Two-column: Trend + Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Weekly Approval Trend */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-[#111827]">Weekly Approval Volume</h3>
            <span className="text-[10px] text-[#9ca3af]">Last 6 weeks</span>
          </div>
          <div className="flex items-end gap-2.5 h-32 px-1">
            {WEEKLY_TREND.map((w, idx) => {
              const maxApprovals = Math.max(...WEEKLY_TREND.map(x => x.approvals));
              const height = (w.approvals / maxApprovals) * 100;
              const isCurrentWeek = idx === WEEKLY_TREND.length - 1;
              return (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-[#111827] tabular-nums">{w.approvals}</span>
                  <div className="w-full relative" style={{ height: '100px' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t transition-all ${isCurrentWeek ? 'bg-[#4262FF]/25 border-2 border-[#4262FF] border-b-0' : 'bg-[#4262FF]/70'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className={`text-[10px] ${isCurrentWeek ? 'font-medium text-[#4262FF]' : 'text-[#9ca3af]'}`}>{w.week}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#f0f1f4] flex items-center justify-between text-[10px] text-[#9ca3af]">
            <span>Avg. weekly: <span className="font-medium text-[#111827]">78</span></span>
            <span className="text-[#4262FF]">Current week (partial)</span>
          </div>
        </div>

        {/* Approval Time Distribution */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-[#111827]">Approval Time Distribution</h3>
            <span className="text-[10px] text-[#9ca3af]">{timePeriod}</span>
          </div>
          <div className="space-y-2">
            {APPROVAL_TIME_DISTRIBUTION.map(d => (
              <div key={d.bucket}>
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="text-[#374151] font-medium">{d.bucket}</span>
                  <span className="text-[#9ca3af] tabular-nums">{d.count} ({d.pct}%)</span>
                </div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#f0f1f4] flex items-center gap-1.5 text-[10px]">
            <Info className="w-3 h-3 text-[#9ca3af]" />
            <span className="text-[#9ca3af]">72% within 4h (SLA target: 80%)</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-[#4262FF]/[0.03] border border-[#4262FF]/15 rounded-lg p-4">
        <h3 className="text-[13px] font-semibold text-[#111827] mb-2.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#4262FF]" />
          Key Insights — {timePeriod}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#111827]">VP Approval is #1 bottleneck</div>
              <div className="text-[10px] text-[#9ca3af] mt-0.5 leading-relaxed">Avg 8.4h — 2x slower than SLA. 6 pending.</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-600" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#111827]">Multi-Year &gt; 3yr: 22% rejection</div>
              <div className="text-[10px] text-[#9ca3af] mt-0.5 leading-relaxed">Consider lowering to 2yr threshold.</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingDown className="w-2.5 h-2.5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#111827]">Deal Desk turnaround +5%</div>
              <div className="text-[10px] text-[#9ca3af] mt-0.5 leading-relaxed">Down to 0.8d. Yi-an Zhang leads at 94% SLA.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottlenecksTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[13px] font-semibold text-[#111827] mb-0.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Where are approvals slowing deals down?
        </h3>
        <p className="text-[10px] text-[#9ca3af] mb-3">Average days to approval by stage — last 30 days</p>
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Approval Stage</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Avg. Days</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Deals</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">% Total</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Impact</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody>
              {BOTTLENECK_STAGES.sort((a, b) => b.avgDays - a.avgDays).map((s, idx) => (
                <tr key={s.stage} className={`border-b border-[#f0f1f4] last:border-0 ${idx < 2 ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {idx < 2 && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                      <span className="font-medium text-[#111827]">{s.stage}</span>
                    </div>
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`font-bold tabular-nums ${s.avgDays > 2 ? 'text-red-600' : s.avgDays > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {s.avgDays}d
                    </span>
                  </td>
                  <td className="text-center px-4 py-2.5 text-[#374151] tabular-nums">{s.dealCount}</td>
                  <td className="text-center px-4 py-2.5 text-[#9ca3af] tabular-nums">{s.pctOfTotal}%</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((s.avgDays / 3.5) * 100, 100)}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                      s.trend > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {s.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(s.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-[#111827] mb-0.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-500" />
          Who is a bottleneck?
        </h3>
        <p className="text-[10px] text-[#9ca3af] mb-3">Individual approver performance — sorted by SLA compliance</p>
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Approver</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Group</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Avg. Time</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Done</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Pending</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Rejected</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">SLA</th>
              </tr>
            </thead>
            <tbody>
              {APPROVER_PERFORMANCE.sort((a, b) => a.sla - b.sla).map((a) => (
                <tr key={a.name} className={`border-b border-[#f0f1f4] last:border-0 ${a.sla < 60 ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${a.sla < 60 ? 'bg-red-500' : a.sla < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        {a.avatar}
                      </div>
                      <span className="font-medium text-[#111827]">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#6b7280]">{a.group}</td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`font-semibold tabular-nums ${parseFloat(a.avgTime) > 6 ? 'text-red-600' : parseFloat(a.avgTime) > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {a.avgTime}
                    </span>
                  </td>
                  <td className="text-center px-4 py-2.5 text-[#374151] tabular-nums">{a.approvals}</td>
                  <td className="text-center px-4 py-2.5">
                    {a.pending > 5 ? (
                      <span className="inline-flex items-center gap-0.5 text-red-600 font-medium tabular-nums">
                        {a.pending}
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[#374151] tabular-nums">{a.pending}</span>
                    )}
                  </td>
                  <td className="text-center px-4 py-2.5 text-[#374151] tabular-nums">{a.rejections}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${a.sla}%`,
                          backgroundColor: a.sla >= 80 ? '#22c55e' : a.sla >= 60 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      <span className={`text-[10px] font-bold w-7 text-right tabular-nums ${a.sla >= 80 ? 'text-emerald-600' : a.sla >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {a.sla}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        <div className="mt-2.5 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg p-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-red-800">
            <span className="font-semibold">Action needed:</span> Danek Li (VP of Sales) has 52% SLA with 6 pending. Consider backup approver or auto-escalation after 8h.
          </div>
        </div>
      </div>
    </div>
  );
}

function RulesTab({ filteredRules }: { filteredRules: typeof RULE_TRIGGER_DATA }) {
  const maxCount = Math.max(...RULE_TRIGGER_DATA.map(r => r.count));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[13px] font-semibold text-[#111827] mb-0.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-500" />
          Which rules trigger most often?
        </h3>
        <p className="text-[10px] text-[#9ca3af] mb-3">Rule trigger frequency — last 30 days · {filteredRules.length} rules</p>
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider w-[260px]">Rule</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Category</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Count</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Frequency</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Avg. Time</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Rej. %</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((r) => (
                <tr key={r.rule} className="border-b border-[#f0f1f4] last:border-0 hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-[#111827]">{r.rule}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      r.category === 'pricing' ? 'bg-blue-50 text-blue-600' :
                      r.category === 'terms' ? 'bg-violet-50 text-violet-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {r.category === 'pricing' ? 'Pricing' : r.category === 'terms' ? 'Terms' : 'Custom'}
                    </span>
                  </td>
                  <td className="text-center px-4 py-2.5 font-semibold text-[#111827] tabular-nums">{r.count}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#4262FF]" style={{ width: `${(r.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-[#9ca3af] w-6 text-right tabular-nums">{r.pct}%</span>
                    </div>
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`font-medium tabular-nums ${parseFloat(r.avgTime) > 6 ? 'text-red-600' : parseFloat(r.avgTime) > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {r.avgTime}
                    </span>
                  </td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`font-medium tabular-nums ${r.rejRate > 15 ? 'text-red-600' : r.rejRate > 8 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {r.rejRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Rule Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { cat: 'Pricing', count: 337, rules: 3, color: '#3b82f6', pct: 32, topRule: 'Discount > 20%', topCount: 167 },
          { cat: 'Commercial Terms', count: 515, rules: 4, color: '#8b5cf6', pct: 49, topRule: 'Payment Terms', topCount: 234 },
          { cat: 'Custom', count: 205, rules: 3, color: '#f59e0b', pct: 19, topRule: 'Custom Product → L2', topCount: 156 },
        ].map(c => (
          <div key={c.cat} className="bg-white border border-[#e5e7eb] rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <h4 className="text-[12px] font-semibold text-[#111827]">{c.cat}</h4>
            </div>
            <div className="text-[20px] font-bold text-[#111827] tabular-nums">{c.count}</div>
            <div className="text-[10px] text-[#9ca3af]">across {c.rules} rules ({c.pct}%)</div>
            <div className="mt-2.5 pt-2.5 border-t border-[#f0f1f4]">
              <div className="text-[10px] text-[#9ca3af]">Top rule:</div>
              <div className="text-[11px] font-medium text-[#111827]">{c.topRule} <span className="text-[#4262FF] tabular-nums">({c.topCount})</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveTab({ kpi, timePeriod }: { kpi: typeof KPI_DATA['Last 30 Days']; timePeriod: string }) {
  const totalDeals = kpi.totalApprovals;
  const execDeals = kpi.vpReviews + kpi.cfoReviews;
  const execPct = ((execDeals / totalDeals) * 100).toFixed(1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="VP of Sales Reviews" value={kpi.vpReviews} icon={UserCheck} color="#8b5cf6" subtitle={`${((kpi.vpReviews / totalDeals) * 100).toFixed(1)}% of deals`} />
        <KpiCard label="CFO Reviews" value={kpi.cfoReviews} icon={UserCheck} color="#dc2626" subtitle={`${((kpi.cfoReviews / totalDeals) * 100).toFixed(1)}% of deals`} />
        <KpiCard label="Total Executive" value={execDeals} icon={Users} color="#4262FF" subtitle={`${execPct}% of deals`} />
        <KpiCard label="Exec Avg. Time" value="9.8h" icon={Timer} trend={5} color="#f59e0b" subtitle="Target: < 8h" />
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-[#111827] mb-0.5 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
          Executive review breakdown
        </h3>
        <p className="text-[10px] text-[#9ca3af] mb-3">{timePeriod}</p>
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Level</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Deals</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">%</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Avg Size</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Avg Time</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Top Trigger</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Rate</th>
              </tr>
            </thead>
            <tbody>
              {EXECUTIVE_REVIEWS.map(r => (
                <tr key={r.level} className="border-b border-[#f0f1f4] last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-[#111827]">{r.level}</span>
                  </td>
                  <td className="text-center px-4 py-2.5 font-semibold text-[#111827] tabular-nums">{r.deals}</td>
                  <td className="text-center px-4 py-2.5 text-[#9ca3af] tabular-nums">{r.pctOfTotal}%</td>
                  <td className="text-center px-4 py-2.5 text-[#374151] tabular-nums">{r.avgDealSize}</td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`font-medium tabular-nums ${parseFloat(r.avgTime) > 8 ? 'text-red-600' : 'text-amber-600'}`}>
                      {r.avgTime}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6b7280]">{r.topTrigger}</td>
                  <td className="text-center px-4 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.approvalRate >= 85 ? 'bg-emerald-50 text-emerald-700' :
                      r.approvalRate >= 75 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
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
      </div>

      {/* Stacked bar chart */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
        <h4 className="text-[12px] font-semibold text-[#111827] mb-3">Executive Review Volume by Week</h4>
        <div className="flex items-end gap-2.5 h-24 px-1">
          {[
            { week: 'Jan 6', vp: 11, cfo: 3 },
            { week: 'Jan 13', vp: 13, cfo: 2 },
            { week: 'Jan 20', vp: 14, cfo: 4 },
            { week: 'Jan 27', vp: 10, cfo: 3 },
            { week: 'Feb 3', vp: 12, cfo: 2 },
            { week: 'Feb 10', vp: 5, cfo: 1 },
          ].map((w) => {
            const total = w.vp + w.cfo;
            const maxHeight = 18;
            return (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-[#111827] tabular-nums">{total}</span>
                <div className="w-full flex flex-col" style={{ height: '70px' }}>
                  <div className="flex-1" />
                  <div className="w-full rounded-t-sm bg-red-500/70" style={{ height: `${(w.cfo / maxHeight) * 70}px` }} />
                  <div className="w-full bg-violet-500/70" style={{ height: `${(w.vp / maxHeight) * 70}px` }} />
                </div>
                <span className="text-[10px] text-[#9ca3af]">{w.week}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-[#f0f1f4] flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-violet-500/70" />
            <span className="text-[#9ca3af]">VP of Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-red-500/70" />
            <span className="text-[#9ca3af]">CFO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThresholdsTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[13px] font-semibold text-[#111827] mb-0.5 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-blue-500" />
          Threshold impact analysis
          </h3>
        <p className="text-[10px] text-[#9ca3af] mb-3">Simulated impact of adjusting approval thresholds — last 30 days</p>

        <div className="space-y-3">
          {THRESHOLD_IMPACT.map((t) => (
            <div key={t.threshold} className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-[12px] font-semibold text-[#111827]">{t.threshold}</h4>
                  <div className="text-[10px] text-[#9ca3af] mt-0.5">Current: <span className="font-medium text-[#374151] tabular-nums">{t.currentTriggers}</span> triggers · Avg impact: {t.avgDealImpact}</div>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded-md ${
                  t.recommendation.includes('Consider') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {t.recommendation}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f9fafb] rounded-lg p-3 border border-[#f0f1f4]">
                  <div className="text-[10px] text-[#9ca3af] mb-1">If lowered to {t.ifLowered.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[16px] font-bold text-amber-600 tabular-nums">{t.ifLowered.triggers}</span>
                    <span className="text-[10px] font-medium text-red-600">{t.ifLowered.delta}</span>
                  </div>
                  <div className="mt-1.5 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min((t.ifLowered.triggers / 250) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="bg-[#4262FF]/[0.04] rounded-lg p-3 border-2 border-[#4262FF]/20">
                  <div className="text-[10px] text-[#4262FF] font-medium mb-1">Current</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[16px] font-bold text-[#111827] tabular-nums">{t.currentTriggers}</span>
                    <span className="text-[10px] text-[#9ca3af]">triggers</span>
                  </div>
                  <div className="mt-1.5 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#4262FF]" style={{ width: `${Math.min((t.currentTriggers / 250) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="bg-[#f9fafb] rounded-lg p-3 border border-[#f0f1f4]">
                  <div className="text-[10px] text-[#9ca3af] mb-1">If raised to {t.ifRaised.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[16px] font-bold text-emerald-600 tabular-nums">{t.ifRaised.triggers}</span>
                    <span className="text-[10px] font-medium text-emerald-600">{t.ifRaised.delta}</span>
                  </div>
                  <div className="mt-1.5 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((t.ifRaised.triggers / 250) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#4262FF]/[0.03] border border-[#4262FF]/15 rounded-lg p-4">
        <h4 className="text-[12px] font-semibold text-[#111827] mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          Threshold Optimization Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="font-medium text-[#111827] mb-1">Recommended changes:</div>
            <ul className="space-y-1 text-[#6b7280]">
              <li className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span>Raise <span className="font-medium text-[#111827]">ACV threshold</span> to $300K — saves ~41 VP reviews/mo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ArrowDownRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span>Lower <span className="font-medium text-[#111827]">Multi-Year threshold</span> to 2yr — catches high-rejection deals</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-[#111827] mb-1">Projected impact:</div>
            <ul className="space-y-1 text-[#6b7280]">
              <li className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span>Est. <span className="font-medium text-[#111827]">-0.6h</span> avg approval time reduction</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span>Est. <span className="font-medium text-[#111827]">-38 exec reviews</span>/mo with threshold raise</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
