import { X, Edit, Shield, Trash2 } from 'lucide-react';

interface Trigger {
  id: number;
  name: string;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  impact: { deals: number; avgTime: string };
  category: string;
  fromTemplate?: string;
  createdAt?: string;
}

interface ViewTriggerDrawerProps {
  trigger: Trigger;
  onClose: () => void;
  onEdit: (trigger: Trigger) => void;
  onDelete: (triggerId: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pricing: 'Product Discounts',
  terms: 'Commercial Terms',
  custom: 'Custom Triggers',
};

function triggerCategoryStyle(cat: string) {
  switch (cat) {
    case 'pricing': return 'bg-[#5d7f8e]/10 text-[#5d7f8e]';
    case 'terms': return 'bg-[#8a7a68]/10 text-[#8a7a68]';
    case 'custom': return 'bg-[#1a1a1a]/[0.06] text-[#555]';
    default: return 'bg-[#f0efe9] text-[#666]';
  }
}

export function ViewTriggerDrawer({ trigger, onClose, onEdit, onDelete }: ViewTriggerDrawerProps) {
  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${trigger.name}"?`)) return;
    onDelete(trigger.id);
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="w-4 h-4 text-[#1a1a1a] flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight truncate">{trigger.name}</h2>
              <p className="text-[12px] text-[#999891] mt-0.5">Trigger details</p>
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
            <X className="w-4 h-4 text-[#999891]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Condition */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Condition</h3>
              <div className="space-y-3">
                <ReadOnlyField label="When" value={trigger.when} mono />
              </div>
            </div>

            {/* Approvers */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Approval Chain</h3>
              <div className="space-y-2">
                {trigger.then.map((approver, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f5f6f8] border border-[#e2e0d8] flex items-center justify-center text-[10px] font-medium text-[#666666] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] text-[#1a1a1a]">{approver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Scope</h3>
              <div className="space-y-3">
                <ReadOnlyField label="Segments">
                  {trigger.scope.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {trigger.scope.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[11px] text-[#1a1a1a]">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[13px] text-[#999891]">All segments</span>
                  )}
                </ReadOnlyField>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Settings</h3>
              <div className="space-y-3">
                <ReadOnlyField label="Status">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    trigger.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${trigger.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {trigger.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </ReadOnlyField>
                <ReadOnlyField label="Category">
                  <span className={`text-[11px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${triggerCategoryStyle(trigger.category)}`}>
                    {CATEGORY_LABELS[trigger.category] || trigger.category}
                  </span>
                </ReadOnlyField>
                {trigger.fromTemplate && (
                  <ReadOnlyField label="Source" value={`Template: ${trigger.fromTemplate}`} />
                )}
                {trigger.createdAt && (
                  <ReadOnlyField label="Created" value={trigger.createdAt} />
                )}
              </div>
            </div>

            {/* Impact */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Impact</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="px-3 py-2.5 bg-[#f9fafb] rounded-md border border-[#f0f1f4]">
                  <p className="text-[10px] font-medium text-[#999891] uppercase tracking-wider">Deals affected</p>
                  <p className="text-[15px] font-semibold text-[#1a1a1a] tabular-nums mt-0.5">{trigger.impact.deals}</p>
                </div>
                <div className="px-3 py-2.5 bg-[#f9fafb] rounded-md border border-[#f0f1f4]">
                  <p className="text-[10px] font-medium text-[#999891] uppercase tracking-wider">Avg. approval time</p>
                  <p className="text-[15px] font-semibold text-[#1a1a1a] tabular-nums mt-0.5">{trigger.impact.avgTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="h-8 px-2.5 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="h-8 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(trigger)}
              className="h-8 px-4 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  children,
  mono = false,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-[12px] text-[#999891] flex-shrink-0 w-28">{label}</span>
      {children || (
        <span className={`text-[13px] text-[#1a1a1a] text-right ${mono ? 'font-mono text-[12px]' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}
