import { useState, useMemo } from 'react';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, ArrowUpDown } from 'lucide-react';
import { APPROVER_PERFORMANCE, BOTTLENECK_STAGES } from './reportingData';

type StageSortKey = 'stage' | 'avgDays' | 'dealCount' | 'trend';
type ApproverSortKey = 'name' | 'avgTime' | 'approvals' | 'sla';
type SortDir = 'asc' | 'desc';

interface BottlenecksTabProps {
  stages: typeof BOTTLENECK_STAGES;
}

export function BottlenecksTab({ stages }: BottlenecksTabProps) {
  const [stageSort, setStageSort] = useState<{ key: StageSortKey; dir: SortDir }>({ key: 'avgDays', dir: 'desc' });
  const [approverSort, setApproverSort] = useState<{ key: ApproverSortKey; dir: SortDir }>({ key: 'sla', dir: 'asc' });

  const toggleStageSort = (key: StageSortKey) => {
    setStageSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' },
    );
  };

  const toggleApproverSort = (key: ApproverSortKey) => {
    setApproverSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' },
    );
  };

  const sortedStages = useMemo(() => {
    const sorted = [...stages];
    sorted.sort((a, b) => {
      const av = a[stageSort.key] as number | string;
      const bv = b[stageSort.key] as number | string;
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return stageSort.dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [stages, stageSort]);

  const sortedApprovers = useMemo(() => {
    const sorted = [...APPROVER_PERFORMANCE];
    sorted.sort((a, b) => {
      let av: number | string, bv: number | string;
      if (approverSort.key === 'avgTime') {
        av = parseFloat(a.avgTime);
        bv = parseFloat(b.avgTime);
      } else {
        av = a[approverSort.key];
        bv = b[approverSort.key];
      }
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return approverSort.dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [approverSort]);

  const maxDays = Math.max(...stages.map(s => s.avgDays));

  return (
    <div className="space-y-6">
      {/* Stage bottlenecks */}
      <div>
        <div className="mb-3">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Where are approvals slowing deals down?</h3>
          <p className="text-[10px] text-[#999891] mt-0.5">Average days to approval by stage — last 30 days · {stages.length} stages</p>
        </div>
        <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e2e0d8] bg-[#fafaf8]">
                <SortableHead label="Approval Stage" sortKey="stage" currentSort={stageSort} onToggle={() => toggleStageSort('stage')} />
                <SortableHead label="Avg. Days" sortKey="avgDays" currentSort={stageSort} onToggle={() => toggleStageSort('avgDays')} />
                <SortableHead label="Deals" sortKey="dealCount" currentSort={stageSort} onToggle={() => toggleStageSort('dealCount')} />
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">% Total</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891] w-[120px]">Impact</th>
                <SortableHead label="Trend" sortKey="trend" currentSort={stageSort} onToggle={() => toggleStageSort('trend')} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0efe9]">
              {sortedStages.map((s) => (
                <tr key={s.stage} className={`hover:bg-[#fafaf8] transition-colors ${s.avgDays > 2 ? 'border-l-[3px] border-l-[#1a1a1a]' : ''}`}>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-semibold text-[#1a1a1a]">{s.stage}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                      s.avgDays > 2 ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0efe9] text-[#1a1a1a]'
                    }`}>
                      {s.avgDays}d
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] tabular-nums text-[#1a1a1a]">{s.dealCount}</td>
                  <td className="px-4 py-2.5 text-[11px] tabular-nums text-[#999891]">{s.pctOfTotal}%</td>
                  <td className="px-4 py-2.5">
                    <div className="w-full bg-[#f0efe9] h-1.5 rounded-full">
                      <div
                        className="h-full bg-[#1a1a1a] transition-all rounded-full"
                        style={{ width: `${Math.min((s.avgDays / maxDays) * 100, 100)}%`, opacity: 0.4 + (s.avgDays / maxDays) * 0.6 }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${
                      s.trend > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'
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

      {/* Approver performance */}
      <div>
        <div className="mb-3">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Who is a bottleneck?</h3>
          <p className="text-[10px] text-[#999891] mt-0.5">Individual approver performance — sorted by SLA compliance · {APPROVER_PERFORMANCE.length} approvers</p>
        </div>
        <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e2e0d8] bg-[#fafaf8]">
                <SortableHead label="Approver" sortKey="name" currentSort={approverSort} onToggle={() => toggleApproverSort('name')} />
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Group</th>
                <SortableHead label="Avg. Time" sortKey="avgTime" currentSort={approverSort} onToggle={() => toggleApproverSort('avgTime')} />
                <SortableHead label="Done" sortKey="approvals" currentSort={approverSort} onToggle={() => toggleApproverSort('approvals')} />
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Pending</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Rejected</th>
                <SortableHead label="SLA" sortKey="sla" currentSort={approverSort} onToggle={() => toggleApproverSort('sla')} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0efe9]">
              {sortedApprovers.map((a) => (
                <tr key={a.name} className={`hover:bg-[#fafaf8] transition-colors ${a.sla < 60 ? 'border-l-[3px] border-l-[#1a1a1a]' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                        a.sla < 60 ? 'bg-[#1a1a1a] text-white' : 'bg-[#e2e0d8] text-[#666]'
                      }`}>
                        {a.avatar}
                      </span>
                      <span className="text-[11px] font-semibold text-[#1a1a1a]">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-[#666]">{a.group}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-bold tabular-nums ${
                      parseFloat(a.avgTime) > 6 ? 'text-[#1a1a1a]' : 'text-[#999891]'
                    }`}>
                      {a.avgTime}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] tabular-nums text-[#1a1a1a]">{a.approvals}</td>
                  <td className="px-4 py-2.5">
                    {a.pending > 5 ? (
                      <span className="text-[11px] font-bold text-[#1a1a1a] tabular-nums underline decoration-1 underline-offset-2">
                        {a.pending}
                      </span>
                    ) : (
                      <span className="text-[11px] tabular-nums text-[#999891]">{a.pending}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[11px] tabular-nums text-[#999891]">{a.rejections}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 bg-[#f0efe9] h-1.5 rounded-full">
                        <div
                          className="h-full bg-[#1a1a1a] transition-all rounded-full"
                          style={{ width: `${a.sla}%`, opacity: a.sla >= 80 ? 0.3 : a.sla >= 60 ? 0.5 : 0.9 }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold w-8 text-right tabular-nums ${
                        a.sla < 60 ? 'text-[#1a1a1a]' : 'text-[#999891]'
                      }`}>
                        {a.sla}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action alert */}
        <div className="mt-3 border-l-[3px] border-l-[#1a1a1a] border border-[#e2e0d8] bg-white rounded-lg px-4 py-3">
          <span className="text-[11px] font-semibold text-[#1a1a1a]">Action needed</span>
          <p className="text-[10px] text-[#999891] mt-0.5">
            Danek Li (VP of Sales) has 52% SLA with 6 pending. Consider backup approver or auto-escalation after 8h.
          </p>
        </div>
      </div>
    </div>
  );
}

function SortableHead({ label, sortKey, currentSort, onToggle }: {
  label: string;
  sortKey: string;
  currentSort: { key: string; dir: SortDir };
  onToggle: () => void;
}) {
  return (
    <th className="px-4 py-2.5">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891] hover:text-[#1a1a1a] transition-colors"
      >
        {label}
        <ArrowUpDown className={`w-3 h-3 ${currentSort.key === sortKey ? 'text-[#1a1a1a]' : 'text-[#ccc]'}`} />
      </button>
    </th>
  );
}
