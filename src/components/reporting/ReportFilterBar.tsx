import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export type ReportTab = 'overview' | 'bottlenecks' | 'rules' | 'executive' | 'thresholds';

interface ReportFilterBarProps {
  activeTab: ReportTab;
  ruleCategoryFilter: string;
  setRuleCategoryFilter: (v: string) => void;
  rejectionFilter: string;
  setRejectionFilter: (v: string) => void;
  bottleneckSlaFilter: string;
  setBottleneckSlaFilter: (v: string) => void;
  filterCount: number;
  onClearAll: () => void;
}

export function ReportFilterBar({
  activeTab,
  ruleCategoryFilter,
  setRuleCategoryFilter,
  rejectionFilter,
  setRejectionFilter,
  bottleneckSlaFilter,
  setBottleneckSlaFilter,
  filterCount,
  onClearAll,
}: ReportFilterBarProps) {
  const showRuleFilters = activeTab === 'rules' || activeTab === 'overview';
  const showBottleneckFilters = activeTab === 'bottlenecks';
  const hasAnyFilters = showRuleFilters || showBottleneckFilters;

  if (!hasAnyFilters) {
    return (
      <div className="border-b border-border bg-muted/30 px-6 py-2.5">
        <span className="text-xs text-muted-foreground">No filters available for this tab</span>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-muted/30 px-6 py-2.5">
      <div className="flex items-center gap-2.5 flex-wrap">
        {showRuleFilters && (
          <>
            <Select
              value={ruleCategoryFilter || '_all'}
              onValueChange={(v) => setRuleCategoryFilter(v === '_all' ? '' : v)}
            >
              <SelectTrigger size="sm" className="w-[140px] h-7 text-xs">
                <SelectValue placeholder="Rule Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Categories</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
                <SelectItem value="terms">Terms</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={rejectionFilter || '_all'}
              onValueChange={(v) => setRejectionFilter(v === '_all' ? '' : v)}
            >
              <SelectTrigger size="sm" className="w-[150px] h-7 text-xs">
                <SelectValue placeholder="Rejection Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Rates</SelectItem>
                <SelectItem value="low">Low (&lt; 8%)</SelectItem>
                <SelectItem value="medium">Medium (8-15%)</SelectItem>
                <SelectItem value="high">High (&gt; 15%)</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        {showBottleneckFilters && (
          <Select
            value={bottleneckSlaFilter || '_all'}
            onValueChange={(v) => setBottleneckSlaFilter(v === '_all' ? '' : v)}
          >
            <SelectTrigger size="sm" className="w-[140px] h-7 text-xs">
              <SelectValue placeholder="Speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Speeds</SelectItem>
              <SelectItem value="fast">Fast (&lt; 1d)</SelectItem>
              <SelectItem value="moderate">Moderate (1-2d)</SelectItem>
              <SelectItem value="slow">Slow (&gt; 2d)</SelectItem>
            </SelectContent>
          </Select>
        )}
        {filterCount > 0 && (
          <button
            onClick={onClearAll}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
