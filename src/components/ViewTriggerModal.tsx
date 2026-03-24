import { X, Save, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface ViewTriggerModalProps {
  trigger: Trigger;
  onClose: () => void;
  onSave?: (updatedTrigger: Trigger) => void;
  onDelete?: (triggerId: number) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'pricing', label: 'Product Discounts' },
  { value: 'terms', label: 'Commercial Terms' },
  { value: 'custom', label: 'Custom Triggers' },
];

export function ViewTriggerModal({ trigger, onClose, onSave, onDelete }: ViewTriggerModalProps) {
  const [editedTrigger, setEditedTrigger] = useState<Trigger>({ ...trigger });
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave?.(editedTrigger);
      toast.success(`Trigger "${editedTrigger.name}" saved successfully`);
      onClose();
    } catch {
      toast.error('Failed to save trigger. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${editedTrigger.name}"?`)) return;
    try {
      onDelete?.(editedTrigger.id);
      toast.success(`Trigger "${editedTrigger.name}" deleted successfully`);
      onClose();
    } catch {
      toast.error('Failed to delete trigger. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-5 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight truncate">{editedTrigger.name}</h2>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
              <X className="w-3.5 h-3.5 text-[#999891]" />
            </button>
          </div>
          <div className="mt-1.5">
            <label className="block text-[11px] font-medium text-[#1a1a1a] mb-0.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={1}
              className="w-full px-2.5 py-1 border border-[#e2e0d8] rounded-md text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[28px] transition-colors placeholder:text-[#999891]"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Condition */}
            <div>
              <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Condition (When)</h3>
              <input
                type="text"
                value={editedTrigger.when}
                onChange={(e) => setEditedTrigger({ ...editedTrigger, when: e.target.value })}
                className="w-full h-7 px-2 border border-[#e2e0d8] rounded-md bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                placeholder="e.g., Discount > 20%"
              />
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Approvers */}
            <div>
              <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Approvers (Then)</h3>
              <div className="space-y-1.5">
                {editedTrigger.then.map((approver, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#f5f6f8] border border-[#e2e0d8] flex items-center justify-center text-[10px] font-medium text-[#666666] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={approver}
                      onChange={(e) => {
                        const newThen = [...editedTrigger.then];
                        newThen[idx] = e.target.value;
                        setEditedTrigger({ ...editedTrigger, then: newThen });
                      }}
                      className="flex-1 h-7 px-2 border border-[#e2e0d8] rounded-md bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                      placeholder="Approver group name"
                    />
                    {editedTrigger.then.length > 1 && (
                      <button
                        onClick={() => {
                          const newThen = editedTrigger.then.filter((_, i) => i !== idx);
                          setEditedTrigger({ ...editedTrigger, then: newThen });
                        }}
                        className="p-1 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setEditedTrigger({ ...editedTrigger, then: [...editedTrigger.then, ''] })}
                  className="text-[11px] text-[#1a1a1a] hover:text-[#333333] font-medium mt-1 transition-colors"
                >
                  + Add approver
                </button>
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Scope */}
            <div>
              <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Scope</h3>
              <div className="space-y-1.5">
                {editedTrigger.scope.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => {
                        const newScope = [...editedTrigger.scope];
                        newScope[idx] = e.target.value;
                        setEditedTrigger({ ...editedTrigger, scope: newScope });
                      }}
                      className="flex-1 h-7 px-2 border border-[#e2e0d8] rounded-md bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                      placeholder="e.g., Enterprise, US"
                    />
                    {editedTrigger.scope.length > 1 && (
                      <button
                        onClick={() => {
                          const newScope = editedTrigger.scope.filter((_, i) => i !== idx);
                          setEditedTrigger({ ...editedTrigger, scope: newScope });
                        }}
                        className="p-1 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setEditedTrigger({ ...editedTrigger, scope: [...editedTrigger.scope, ''] })}
                  className="text-[11px] text-[#1a1a1a] hover:text-[#333333] font-medium mt-1 transition-colors"
                >
                  + Add scope
                </button>
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Status & Category */}
            <div>
              <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Status</label>
                  <div className="flex gap-1">
                    {(['active', 'paused'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditedTrigger({ ...editedTrigger, status: s })}
                        className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-all inline-flex items-center gap-1 ${
                          editedTrigger.status === s
                            ? s === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${
                          editedTrigger.status === s
                            ? s === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                            : 'bg-[#999891]'
                        }`} />
                        {s === 'active' ? 'Active' : 'Paused'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Category</label>
                  <select
                    value={editedTrigger.category}
                    onChange={(e) => setEditedTrigger({ ...editedTrigger, category: e.target.value })}
                    className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded-md bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                  >
                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Impact (read-only) */}
            <div>
              <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Impact</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="px-3 py-2.5 bg-[#f9fafb] rounded-md border border-[#f0f1f4]">
                  <p className="text-[10px] font-medium text-[#999891] uppercase tracking-wider">Deals affected</p>
                  <p className="text-[15px] font-semibold text-[#1a1a1a] tabular-nums mt-0.5">{editedTrigger.impact.deals}</p>
                </div>
                <div className="px-3 py-2.5 bg-[#f9fafb] rounded-md border border-[#f0f1f4]">
                  <p className="text-[10px] font-medium text-[#999891] uppercase tracking-wider">Avg. approval time</p>
                  <p className="text-[15px] font-semibold text-[#1a1a1a] tabular-nums mt-0.5">{editedTrigger.impact.avgTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-5 py-2.5 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="h-7 px-2.5 text-[#333333] text-[11px] font-medium transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 inline-flex items-center gap-1 rounded-md"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-7 px-2.5 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving&hellip;
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
