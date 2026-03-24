import {
  BarChart3, Search, Download, Filter,
  AlertTriangle, Zap, UserCheck, Target, X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { OverviewTab } from './OverviewTab';
import { BottlenecksTab } from './BottlenecksTab';
import { RulesTab } from './RulesTab';
import { ExecutiveTab } from './ExecutiveTab';
import { ThresholdsTab } from './ThresholdsTab';
import {
  TIME_PERIODS,
  KPI_DATA,
  RULE_TRIGGER_DATA,
  BOTTLENECK_STAGES,
  type TimePeriod,
} from './reportingData';
import type { ReportTab } from './ReportFilterBar';

export function Reporting() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Last 30 Days');
  const [showFilters, setShowFilters] = useState(false);
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState('');
  const [rejectionFilter, setRejectionFilter] = useState('');
  const [bottleneckSlaFilter, setBottleneckSlaFilter] = useState('');

  const kpi = KPI_DATA[timePeriod];

  const reportFilterCount = [ruleCategoryFilter, rejectionFilter, bottleneckSlaFilter].filter(Boolean).length;

  const clearReportFilters = () => {
    setRuleCategoryFilter('');
    setRejectionFilter('');
    setBottleneckSlaFilter('');
  };

  const handleExport = () => {
    toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report exported`);
  };

  const filteredRules = useMemo(() => {
    let data = RULE_TRIGGER_DATA;
    if (ruleCategoryFilter) data = data.filter(r => r.category === ruleCategoryFilter);
    if (rejectionFilter === 'low') data = data.filter(r => r.rejRate < 8);
    else if (rejectionFilter === 'medium') data = data.filter(r => r.rejRate >= 8 && r.rejRate <= 15);
    else if (rejectionFilter === 'high') data = data.filter(r => r.rejRate > 15);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(r => r.rule.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery, ruleCategoryFilter, rejectionFilter]);

  const filteredBottleneckStages = useMemo(() => {
    if (!bottleneckSlaFilter) return BOTTLENECK_STAGES;
    if (bottleneckSlaFilter === 'slow') return BOTTLENECK_STAGES.filter(s => s.avgDays > 2);
    if (bottleneckSlaFilter === 'moderate') return BOTTLENECK_STAGES.filter(s => s.avgDays > 1 && s.avgDays <= 2);
    if (bottleneckSlaFilter === 'fast') return BOTTLENECK_STAGES.filter(s => s.avgDays <= 1);
    return BOTTLENECK_STAGES;
  }, [bottleneckSlaFilter]);

  const TABS: { key: ReportTab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'bottlenecks', label: 'Bottlenecks', icon: AlertTriangle },
    { key: 'rules', label: 'Rules & Triggers', icon: Zap },
    { key: 'executive', label: 'Executive Reviews', icon: UserCheck },
    { key: 'thresholds', label: 'Threshold Impact', icon: Target },
  ];

  const showRuleFilters = activeTab === 'rules' || activeTab === 'overview';
  const showBottleneckFilters = activeTab === 'bottlenecks';
  const hasAnyFilters = showRuleFilters || showBottleneckFilters;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Reporting</h1>
            <p className="text-[#999891] text-[11px] mt-0.5">
              Approval performance, bottlenecks, and trigger impact analysis
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative inline-flex items-center">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="h-8 pl-2.5 pr-7 bg-white border border-[#e2e0d8] rounded-md text-[12px] font-medium text-[#1a1a1a] transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 hover:border-[#1a1a1a]/30"
              >
                {TIME_PERIODS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <svg className="w-3 h-3 absolute right-2 pointer-events-none text-[#999891]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999891] hover:text-[#1a1a1a]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 px-2.5 border rounded-md inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
                reportFilterCount > 0
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                  : 'border-[#e2e0d8] text-[#333333] hover:bg-[#f9fafb]'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${reportFilterCount > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
              Filters
              {reportFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[10px] flex items-center justify-center">{reportFilterCount}</span>
              )}
            </button>
            <button
              onClick={handleExport}
              className="h-8 px-2.5 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[#333333] text-[12px] font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
            >
              <Download className="w-3.5 h-3.5 text-[#999891]" />
              Export
            </button>
          </div>
        </div>

        {/* Underline tabs */}
        <div className="flex items-center gap-0.5 border-b border-transparent -mb-[1px]">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 inline-flex items-center gap-1.5 ${
                activeTab === key
                  ? 'border-[#1a1a1a] text-[#1a1a1a]'
                  : 'border-transparent text-[#999891] hover:text-[#666]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Filter Bar */}
      {showFilters && hasAnyFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#fafaf8] px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {showRuleFilters && (
              <>
                <ReportFilterSelect
                  label="Category"
                  value={ruleCategoryFilter}
                  options={[
                    { value: 'pricing', label: 'Pricing' },
                    { value: 'terms', label: 'Terms' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  onChange={setRuleCategoryFilter}
                />
                <ReportFilterSelect
                  label="Rejection Rate"
                  value={rejectionFilter}
                  options={[
                    { value: 'low', label: 'Low (< 8%)' },
                    { value: 'medium', label: 'Medium (8-15%)' },
                    { value: 'high', label: 'High (> 15%)' },
                  ]}
                  onChange={setRejectionFilter}
                />
              </>
            )}
            {showBottleneckFilters && (
              <ReportFilterSelect
                label="Speed"
                value={bottleneckSlaFilter}
                options={[
                  { value: 'fast', label: 'Fast (< 1d)' },
                  { value: 'moderate', label: 'Moderate (1-2d)' },
                  { value: 'slow', label: 'Slow (> 2d)' },
                ]}
                onChange={setBottleneckSlaFilter}
              />
            )}
            {reportFilterCount > 0 && (
              <button
                onClick={clearReportFilters}
                className="h-7 px-2 text-[11px] text-[#999891] hover:text-[#333333] inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
      {showFilters && !hasAnyFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#fafaf8] px-6 py-2.5">
          <span className="text-[11px] text-[#999891]">No filters available for this tab</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {activeTab === 'overview' && <OverviewTab kpi={kpi} timePeriod={timePeriod} />}
        {activeTab === 'bottlenecks' && <BottlenecksTab stages={filteredBottleneckStages} />}
        {activeTab === 'rules' && <RulesTab filteredRules={filteredRules} />}
        {activeTab === 'executive' && <ExecutiveTab kpi={kpi} timePeriod={timePeriod} />}
        {activeTab === 'thresholds' && <ThresholdsTab />}
      </div>
    </div>
  );
}

function ReportFilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-7 pl-2 pr-6 border rounded-md text-[11px] font-medium transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
          value
            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
            : 'bg-white text-[#666666] border-[#e2e0d8] hover:border-[#1a1a1a]/30'
        }`}
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <svg className={`w-3 h-3 absolute right-1.5 pointer-events-none ${value ? 'text-white' : 'text-[#999891]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
