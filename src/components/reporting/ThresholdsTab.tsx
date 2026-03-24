import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { THRESHOLD_IMPACT } from './reportingData';

const MAX_TRIGGERS = 250;

export function ThresholdsTab() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Threshold impact analysis</h3>
          <p className="text-[10px] text-[#999891] mt-0.5">Simulated impact of adjusting approval thresholds — last 30 days · {THRESHOLD_IMPACT.length} thresholds</p>
        </div>

        <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e2e0d8] bg-[#fafaf8]">
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Threshold</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Current</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">If Lowered</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">If Raised</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Avg Impact</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891]">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0efe9]">
              {THRESHOLD_IMPACT.map((t) => (
                <tr key={t.threshold} className="hover:bg-[#fafaf8] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold text-[#1a1a1a]">{t.threshold}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold tabular-nums text-[#1a1a1a]">{t.currentTriggers}</span>
                    <span className="text-[10px] text-[#999891] ml-1">triggers</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-[#999891]">{t.ifLowered.label}:</span>
                      <span className="text-[11px] font-bold tabular-nums text-[#1a1a1a]">{t.ifLowered.triggers}</span>
                      <span className="text-[10px] font-bold text-[#666]">{t.ifLowered.delta}</span>
                    </div>
                    <div className="mt-1 w-full bg-[#f0efe9] h-1 rounded-full">
                      <div
                        className="h-full bg-[#1a1a1a] transition-all rounded-full"
                        style={{ width: `${Math.min((t.ifLowered.triggers / MAX_TRIGGERS) * 100, 100)}%`, opacity: 0.5 }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-[#999891]">{t.ifRaised.label}:</span>
                      <span className="text-[11px] font-bold tabular-nums text-[#1a1a1a]">{t.ifRaised.triggers}</span>
                      <span className="text-[10px] font-bold text-[#999891]">{t.ifRaised.delta}</span>
                    </div>
                    <div className="mt-1 w-full bg-[#f0efe9] h-1 rounded-full">
                      <div
                        className="h-full bg-[#1a1a1a] transition-all rounded-full"
                        style={{ width: `${Math.min((t.ifRaised.triggers / MAX_TRIGGERS) * 100, 100)}%`, opacity: 0.25 }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-bold tabular-nums text-[#1a1a1a]">{t.avgDealImpact}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      t.recommendation.includes('Consider')
                        ? 'bg-[#1a1a1a] text-white'
                        : 'bg-[#f0efe9] text-[#666]'
                    }`}>
                      {t.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Summary */}
      <div className="border border-[#e2e0d8] bg-white rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-4 py-2.5 border-b border-[#f0efe9]">
          <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Threshold Optimization Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-[#f0efe9]">
          <div className="px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891] mb-2">Recommended Changes</div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <ArrowUpRight className="w-3 h-3 text-[#999891] flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-[#666]">
                  Raise <span className="font-semibold text-[#1a1a1a]">ACV threshold</span> to $300K — saves ~41 VP reviews/mo
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowDownRight className="w-3 h-3 text-[#999891] flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-[#666]">
                  Lower <span className="font-semibold text-[#1a1a1a]">Multi-Year threshold</span> to 2yr — catches high-rejection deals
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#999891] mb-2">Projected Impact</div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="w-3 h-3 text-[#999891] flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-[#666]">
                  Est. <span className="font-bold text-[#1a1a1a]">-0.6h</span> avg approval time reduction
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#999891] flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-[#666]">
                  Est. <span className="font-bold text-[#1a1a1a]">-38 exec reviews</span>/mo with threshold raise
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
