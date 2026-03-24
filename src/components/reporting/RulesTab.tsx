import { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { RULE_TRIGGER_DATA, RULE_CATEGORY_SUMMARY } from './reportingData';

type RuleSortKey = 'rule' | 'count' | 'rejRate' | 'avgTime';
type SortDir = 'asc' | 'desc';

interface RulesTabProps {
  filteredRules: typeof RULE_TRIGGER_DATA;
}

const CATEGORY_LABEL: Record<string, string> = {
  pricing: 'Pricing',
  terms: 'Terms',
  custom: 'Custom',
};

export function RulesTab({ filteredRules }: RulesTabProps) {
  const [sort, setSort] = useState<{ key: RuleSortKey; dir: SortDir }>({ key: 'count', dir: 'desc' });
  const maxCount = Math.max(...RULE_TRIGGER_DATA.map(r => r.count));

  const toggleSort = (key: RuleSortKey) => {
    setSort(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' },
    );
  };

  const sortedRules = useMemo(() => {
    const arr = [...filteredRules];
    arr.sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sort.key === 'avgTime') {
        av = parseFloat(a.avgTime);
        bv = parseFloat(b.avgTime);
      } else {
        av = a[sort.key];
        bv = b[sort.key];
      }
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredRules, sort]);

  const SortableHead = ({ label, sortKey }: { label: string; sortKey: RuleSortKey }) => (
    <th className="px-4 py-2.5">
      <button
        onClick={() => toggleSort(sortKey)}
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891] hover:text-[#1a1a1a] transition-colors"
      >
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sort.key === sortKey ? 'text-[#1a1a1a]' : 'text-[#ccc]'}`} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Which rules trigger most often?</h3>
        <p className="text-[10px] text-[#999891] mt-0.5">Rule trigger frequency — last 30 days · {filteredRules.length} rules</p>
      </div>

      {/* Rules table */}
      <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#e2e0d8] bg-[#fafaf8]">
              <SortableHead label="Rule" sortKey="rule" />
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Category</th>
              <SortableHead label="Count" sortKey="count" />
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891] w-[120px]">Frequency</th>
              <SortableHead label="Avg. Time" sortKey="avgTime" />
              <SortableHead label="Rej. %" sortKey="rejRate" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efe9]">
            {sortedRules.map((r) => (
              <tr key={r.rule} className="hover:bg-[#fafaf8] transition-colors">
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-medium text-[#1a1a1a]">{r.rule}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#f0efe9] text-[#666]">
                    {CATEGORY_LABEL[r.category]}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[11px] font-bold tabular-nums text-[#1a1a1a]">{r.count}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-[#f0efe9] h-1.5 rounded-full">
                      <div
                        className="h-full bg-[#1a1a1a] transition-all rounded-full"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#999891] w-7 text-right tabular-nums">{r.pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] font-bold tabular-nums ${
                    parseFloat(r.avgTime) > 6 ? 'text-[#1a1a1a]' : 'text-[#999891]'
                  }`}>
                    {r.avgTime}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] tabular-nums ${
                    r.rejRate > 15 ? 'font-bold text-[#1a1a1a]' : 'text-[#999891]'
                  }`}>
                    {r.rejRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category breakdown */}
      <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-2.5 border-b border-[#f0efe9]">
          <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Category Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-[#f0efe9]">
          {RULE_CATEGORY_SUMMARY.map(c => (
            <div key={c.cat} className="px-4 py-3">
              <span className="text-[11px] font-semibold text-[#1a1a1a]">{c.cat}</span>
              <div className="text-lg font-bold text-[#1a1a1a] tabular-nums mt-1">{c.count}</div>
              <div className="text-[10px] text-[#999891]">across {c.rules} rules ({c.pct}%)</div>
              <div className="mt-2 pt-2 border-t border-[#f0efe9]">
                <div className="text-[10px] text-[#999891]">Top rule:</div>
                <div className="text-[10px] text-[#1a1a1a] mt-0.5">
                  {c.topRule} <span className="tabular-nums text-[#999891]">({c.topCount})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
