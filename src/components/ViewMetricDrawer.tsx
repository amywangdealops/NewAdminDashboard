import { X, Edit, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Metric } from './metricStore';

interface ViewMetricDrawerProps {
  metric: Metric;
  onClose: () => void;
  onEdit: (metric: Metric) => void;
}

export function ViewMetricDrawer({ metric, onClose, onEdit }: ViewMetricDrawerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <DollarSign className="w-4 h-4 text-[#1a1a1a] flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight truncate">{metric.name}</h2>
              <p className="text-[12px] text-[#999891] mt-0.5">Metric details</p>
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
            <X className="w-4 h-4 text-[#999891]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ── Details Section ───────────────────────── */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Details</h3>
              <div className="space-y-3">
                <ReadOnlyField label="Metric Name" value={metric.name} />
                <ReadOnlyField label="Description" value={metric.description || '—'} />
                <ReadOnlyField label="Type">
                  <TypeBadge type={metric.type} />
                </ReadOnlyField>
                <ReadOnlyField label="Segment" value={metric.segment} />
                <ReadOnlyField label="Status">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    metric.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${metric.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {metric.status}
                  </span>
                </ReadOnlyField>
              </div>
            </div>

            {/* ── Calculation Section ──────────────────── */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Calculation</h3>
              <div className="space-y-3">
                <ReadOnlyField label="Method" value={metric.calculationMethod} />
                <ReadOnlyField label="Format" value={metric.format} />
                <ReadOnlyField label="Data Source">
                  <SourceBadge source={metric.dataSource} />
                </ReadOnlyField>
                <ReadOnlyField label="Frequency" value={metric.frequency} />
                {metric.formula && (
                  <ReadOnlyField label="Formula">
                    <code className="text-[11px] font-mono bg-[#f5f6f8] border border-[#e2e0d8] px-1.5 py-0.5 rounded text-[#1a1a1a]">
                      {metric.formula}
                    </code>
                  </ReadOnlyField>
                )}
                <ReadOnlyField label="Used In" value={`${metric.usedInCount} report${metric.usedInCount !== 1 ? 's' : ''}`} />
              </div>
            </div>

            {/* ── Advanced Section ─────────────────────── */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[13px] font-medium text-[#1a1a1a] hover:text-[#333333] transition-colors w-full"
              >
                {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Advanced</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-3">
                  <ReadOnlyField label="Display Order" value={String(metric.displayOrder)} />
                  <ReadOnlyField label="Precision" value={`${metric.precision} decimals`} />
                  <ReadOnlyField label="Created" value={new Date(metric.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-6 py-3.5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-8 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(metric)}
            className="h-8 px-4 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────

function ReadOnlyField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-[12px] text-[#999891] flex-shrink-0 w-36">{label}</span>
      {children || (
        <span className="text-[13px] text-[#1a1a1a] text-right">{value}</span>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Financial: 'bg-blue-50 text-blue-700',
    Operational: 'bg-amber-50 text-amber-700',
    Custom: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    CRM: 'bg-emerald-50 text-emerald-700',
    Manual: 'bg-gray-100 text-gray-600',
    Calculated: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${styles[source] || 'bg-gray-100 text-gray-600'}`}>
      {source}
    </span>
  );
}
