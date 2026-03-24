import { X, Check, Plus, Trash2, GripVertical, Layers, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { saveTrigger } from './triggerStore';
import { toast } from 'sonner';

// --- Prefill data passed from a template ---
export interface TriggerPrefill {
  templateName: string;
  templateDescription: string;
  name: string;
  condition: string;
  approvers: string[];
  segments: string[];
  category: string;
}

interface CreateTriggerModalProps {
  onClose: () => void;
  onSave?: () => void;
  prefill?: TriggerPrefill;
}

// ─── VARIABLES & OPERATORS ──────────────────────────────

interface VariableDef {
  field: string;
  label: string;
  type: 'number' | 'currency' | 'percent' | 'select' | 'boolean';
  operators: string[];
  options?: string[];
  unit?: string;
  placeholder?: string;
}

const TRIGGER_VARIABLES: VariableDef[] = [
  { field: 'discount', label: 'Discount', type: 'percent', operators: ['>', '>=', '<', '<=', '=', '!='], placeholder: '20' },
  { field: 'acv', label: 'ACV (Annual Contract Value)', type: 'currency', operators: ['>', '>=', '<', '<=', '=', '!='], placeholder: '500000' },
  { field: 'deal_size', label: 'Total Deal Size', type: 'currency', operators: ['>', '>=', '<', '<=', '=', '!='], placeholder: '1000000' },
  { field: 'contract_length', label: 'Contract Length (months)', type: 'number', operators: ['>', '>=', '<', '<=', '=', '!='], placeholder: '12' },
  { field: 'payment_terms', label: 'Payment Terms', type: 'select', operators: ['=', '!='], options: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'Upfront', 'Custom'] },
  { field: 'billing_frequency', label: 'Billing Frequency', type: 'select', operators: ['=', '!='], options: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'] },
  { field: 'auto_renewal', label: 'Auto-Renewal', type: 'boolean', operators: ['='], options: ['On', 'Off'] },
  { field: 'product_type', label: 'Product Type', type: 'select', operators: ['=', '!='], options: ['Standard', 'Custom', 'Add-on', 'Professional Services'] },
  { field: 'region', label: 'Region', type: 'select', operators: ['=', '!='], options: ['US', 'EMEA', 'APAC', 'LATAM', 'Global'] },
  { field: 'price_override', label: 'Price Override', type: 'boolean', operators: ['='], options: ['Yes', 'No'] },
  { field: 'ramp_deal', label: 'Ramp Deal', type: 'boolean', operators: ['='], options: ['Yes', 'No'] },
  { field: 'multi_year', label: 'Multi-Year Deal', type: 'boolean', operators: ['='], options: ['Yes', 'No'] },
];

const KNOWN_APPROVERS = [
  'Deal Desk', 'Deal Ops', 'Finance', 'VP of Sales', 'VP of Sales (EMEA)',
  'Head of Mid-Market', 'Head of Sales', 'Legal', 'Customer Success',
  'Product Team', 'Engineering', 'CFO', 'CRO', 'RevOps',
];

const SCOPE_CATEGORIES: { label: string; items: string[] }[] = [
  { label: 'Segment', items: ['Enterprise', 'Mid-Market', 'SMB'] },
  { label: 'Region', items: ['US', 'EMEA', 'APAC', 'LATAM'] },
  { label: 'Customer Type', items: ['New Customer', 'Existing Customer'] },
  { label: 'Deal Type', items: ['New Business', 'Amendment', 'Renewal'] },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'pricing', label: 'Product Discounts' },
  { value: 'terms', label: 'Commercial Terms' },
  { value: 'custom', label: 'Custom Triggers' },
];

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatCondition(c: Condition): string {
  const v = TRIGGER_VARIABLES.find(tv => tv.field === c.field);
  if (!v) return `${c.field} ${c.operator} ${c.value}`;
  if (v.type === 'percent') return `${v.label} ${c.operator} ${c.value}%`;
  if (v.type === 'currency') return `${v.label} ${c.operator} $${Number(c.value).toLocaleString()}`;
  return `${v.label} ${c.operator} ${c.value}`;
}

// ─── MAIN COMPONENT ────────────────────────────────────
export function CreateTriggerModal({ onClose, onSave, prefill }: CreateTriggerModalProps) {
  if (prefill) {
    return <TemplateReviewMode prefill={prefill} onClose={onClose} onSave={onSave} />;
  }
  return <BuilderMode onClose={onClose} onSave={onSave} />;
}

// ─── FULL BUILDER MODE (replaces old wizard) ────────────
function BuilderMode({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: () => void;
}) {
  const [triggerName, setTriggerName] = useState('');
  const [category, setCategory] = useState('custom');
  const [conditions, setConditions] = useState<Condition[]>([
    { id: makeId(), field: '', operator: '', value: '' },
  ]);
  const [approvers, setApprovers] = useState<string[]>([]);
  const [approverInput, setApproverInput] = useState('');
  const [showApproverSuggestions, setShowApproverSuggestions] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addCondition = () => {
    setConditions(prev => [...prev, { id: makeId(), field: '', operator: '', value: '' }]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length <= 1) return;
    setConditions(prev => prev.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, patch: Partial<Condition>) => {
    setConditions(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...patch };
      if (patch.field && patch.field !== c.field) {
        const varDef = TRIGGER_VARIABLES.find(v => v.field === patch.field);
        updated.operator = varDef?.operators[0] || '>';
        updated.value = '';
      }
      return updated;
    }));
  };

  const addApprover = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !approvers.includes(trimmed)) {
      setApprovers(prev => [...prev, trimmed]);
    }
    setApproverInput('');
    setShowApproverSuggestions(false);
  };

  const removeApprover = (idx: number) => setApprovers(prev => prev.filter((_, i) => i !== idx));

  const filteredApproverSuggestions = KNOWN_APPROVERS.filter(
    a => !approvers.includes(a) && a.toLowerCase().includes(approverInput.toLowerCase())
  );

  const validConditions = conditions.filter(c => c.field && c.operator && c.value);
  const canSave = validConditions.length > 0 && approvers.length > 0;

  const getConditionText = () => {
    return validConditions.map(c => formatCondition(c)).join(' AND ');
  };

  const inferCategory = () => {
    const fields = validConditions.map(c => c.field);
    if (fields.some(f => ['discount', 'acv', 'deal_size', 'price_override'].includes(f))) return 'pricing';
    if (fields.some(f => ['payment_terms', 'billing_frequency', 'auto_renewal', 'contract_length', 'multi_year'].includes(f))) return 'terms';
    return 'custom';
  };

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Add at least one condition and one approver.');
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const conditionText = getConditionText();
      const finalName = triggerName.trim() || `${approvers[0]} \u2014 ${conditionText}`;
      const finalCategory = category === 'custom' ? inferCategory() : category;

      saveTrigger({
        name: finalName,
        when: conditionText,
        then: approvers,
        scope: segments.length > 0 ? segments : ['All segments'],
        status: 'active',
        category: finalCategory,
        impact: { deals: 0, avgTime: '\u2014' },
      });

      toast.success(`Trigger "${finalName}" created`, {
        description: "It's now live in Approval Triggers.",
      });
      onSave?.();
      onClose();
    } catch {
      toast.error('Failed to create trigger.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-[480px] min-w-[380px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-5 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight">Create Approval Trigger</h2>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
              <X className="w-3.5 h-3.5 text-[#999891]" />
            </button>
          </div>
          <p className="text-[11px] text-[#999891] mt-0.5">Define conditions, approvers, and scope for this trigger.</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* Trigger Name */}
            <div>
              <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                Trigger Name <span className="text-[#999891] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={triggerName}
                onChange={(e) => setTriggerName(e.target.value)}
                placeholder="Auto-generated from conditions if blank"
                className="w-full h-8 px-2.5 border border-[#e2e0d8] rounded-md bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors placeholder:text-[#999891]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1.5">Category</label>
              <div className="flex gap-1.5">
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-all ${
                      category === opt.value
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* ── CONDITIONS ─────────────────────────────── */}
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
                Conditions (When)
              </label>
              <div className="space-y-2.5">
                {conditions.map((cond, idx) => (
                  <ConditionRow
                    key={cond.id}
                    condition={cond}
                    index={idx}
                    total={conditions.length}
                    onChange={(patch) => updateCondition(cond.id, patch)}
                    onRemove={() => removeCondition(cond.id)}
                  />
                ))}
              </div>
              <button
                onClick={addCondition}
                className="mt-2 text-[11px] text-[#1a1a1a] hover:text-[#333333] font-medium transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add condition
              </button>
              {validConditions.length > 1 && (
                <p className="text-[10px] text-[#999891] mt-1.5">All conditions must be true (AND logic).</p>
              )}
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* ── APPROVERS ──────────────────────────────── */}
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
                Approval Chain (Then)
              </label>
              {approvers.length > 0 && (
                <div className="space-y-1.5 mb-2.5">
                  {approvers.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <span className="w-5 h-5 rounded-full bg-[#f5f6f8] border border-[#e2e0d8] flex items-center justify-center text-[10px] font-medium text-[#666666] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="flex-1 h-7 px-2.5 border border-[#e2e0d8] rounded-md bg-[#f9fafb] text-[12px] text-[#1a1a1a] flex items-center">
                        {a}
                      </span>
                      <button
                        onClick={() => removeApprover(idx)}
                        className="p-1 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={approverInput}
                  onChange={(e) => { setApproverInput(e.target.value); setShowApproverSuggestions(true); }}
                  onFocus={() => setShowApproverSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowApproverSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && approverInput.trim()) {
                      e.preventDefault();
                      addApprover(approverInput);
                    }
                  }}
                  placeholder={approvers.length === 0 ? 'Select or type an approver...' : 'Add next approver in chain...'}
                  className="w-full h-8 px-2.5 border border-[#e2e0d8] rounded-md bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors placeholder:text-[#999891]"
                />
                {showApproverSuggestions && filteredApproverSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e2e0d8] rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredApproverSuggestions.map(a => (
                      <button
                        key={a}
                        onMouseDown={(e) => { e.preventDefault(); addApprover(a); }}
                        className="w-full text-left px-2.5 py-1.5 text-[12px] text-[#1a1a1a] hover:bg-[#f9fafb] transition-colors"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {approvers.length > 1 && (
                <p className="text-[10px] text-[#999891] mt-1.5">
                  Sequential approval: {approvers.join(' \u2192 ')}
                </p>
              )}
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* ── SCOPE / SEGMENTS ────────────────────────── */}
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">
                Scope (Segments)
              </label>
              <ScopePicker selected={segments} onChange={setSegments} />
            </div>

            {/* ── LIVE PREVIEW ────────────────────────────── */}
            {validConditions.length > 0 && approvers.length > 0 && (
              <>
                <hr className="border-[#e2e0d8]" />
                <div className="px-3 py-2.5 bg-[#f9fafb] border border-[#f0f1f4] rounded-md">
                  <div className="text-[10px] font-semibold text-[#999891] uppercase tracking-wider mb-1.5">Preview</div>
                  <p className="text-[12px] text-[#1a1a1a] leading-relaxed">
                    When <span className="font-semibold">{getConditionText()}</span>, require approval from{' '}
                    <span className="font-semibold">{approvers.join(' \u2192 ')}</span>
                    {segments.length > 0 && segments[0] !== 'All segments' && (
                      <span className="text-[#999891]"> for {segments.join(', ')}</span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-5 py-2.5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-7 px-2.5 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="h-7 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving&hellip;
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
                Save Trigger
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONDITION ROW ──────────────────────────────────────
function ConditionRow({
  condition,
  index,
  total,
  onChange,
  onRemove,
}: {
  condition: Condition;
  index: number;
  total: number;
  onChange: (patch: Partial<Condition>) => void;
  onRemove: () => void;
}) {
  const varDef = TRIGGER_VARIABLES.find(v => v.field === condition.field);

  return (
    <div className="space-y-1.5">
      {index > 0 && (
        <div className="flex items-center gap-2 py-0.5">
          <div className="h-px flex-1 bg-[#e2e0d8]" />
          <span className="text-[10px] font-semibold text-[#999891] uppercase">AND</span>
          <div className="h-px flex-1 bg-[#e2e0d8]" />
        </div>
      )}
      <div className="flex items-start gap-1.5">
        <div className="flex-1 space-y-1.5">
          {/* Variable select */}
          <select
            value={condition.field}
            onChange={(e) => onChange({ field: e.target.value })}
            className={`w-full h-8 pl-2.5 pr-7 border border-[#e2e0d8] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer ${
              condition.field ? 'bg-white text-[#1a1a1a]' : 'bg-[#f5f6f8] text-[#999891]'
            }`}
          >
            <option value="">Select a variable...</option>
            {TRIGGER_VARIABLES.map(v => (
              <option key={v.field} value={v.field}>{v.label}</option>
            ))}
          </select>

          {/* Operator + Value */}
          {condition.field && varDef && (
            <div className="flex gap-1.5">
              <select
                value={condition.operator}
                onChange={(e) => onChange({ operator: e.target.value })}
                className="h-8 pl-2.5 pr-7 border border-[#e2e0d8] rounded-md bg-white text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer w-20"
              >
                {varDef.operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>

              {varDef.type === 'select' || varDef.type === 'boolean' ? (
                <select
                  value={condition.value}
                  onChange={(e) => onChange({ value: e.target.value })}
                  className={`flex-1 h-8 pl-2.5 pr-7 border border-[#e2e0d8] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer ${
                    condition.value ? 'bg-white text-[#1a1a1a]' : 'bg-[#f5f6f8] text-[#999891]'
                  }`}
                >
                  <option value="">Select value...</option>
                  {varDef.options?.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <div className="flex-1 relative">
                  {varDef.type === 'currency' && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#999891]">$</span>
                  )}
                  <input
                    type="number"
                    value={condition.value}
                    onChange={(e) => onChange({ value: e.target.value })}
                    placeholder={varDef.placeholder || '0'}
                    className={`w-full h-8 border border-[#e2e0d8] rounded-md bg-white text-[12px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors ${
                      varDef.type === 'currency' ? 'pl-6 pr-2.5' : 'px-2.5'
                    }`}
                  />
                  {varDef.type === 'percent' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#999891]">%</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {total > 1 && (
          <button
            onClick={onRemove}
            className="mt-1.5 p-1 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SCOPE PICKER ───────────────────────────────────────
function ScopePicker({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
  const [openCat, setOpenCat] = useState<string | null>(null);

  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter(s => s !== item) : [...selected, item]);
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded-md text-[11px] text-[#1a1a1a] font-medium">
              {s}
              <button onClick={() => toggle(s)} className="hover:text-red-600 transition-colors"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="space-y-1.5">
        {SCOPE_CATEGORIES.map(cat => {
          const isOpen = openCat === cat.label;
          const selectedInCat = cat.items.filter(i => selected.includes(i));
          return (
            <div key={cat.label} className="border border-[#e2e0d8] rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCat(isOpen ? null : cat.label)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#f9fafb] hover:bg-[#f0f1f4] transition-colors text-left"
              >
                <span className="text-[11px] font-medium text-[#1a1a1a]">
                  {cat.label}
                  {selectedInCat.length > 0 && (
                    <span className="ml-1.5 text-[10px] text-[#999891]">({selectedInCat.length})</span>
                  )}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#999891] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-2.5 py-2 flex flex-wrap gap-1.5 border-t border-[#f0f1f4]">
                  {cat.items.map(item => {
                    const active = selected.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggle(item)}
                        className={`h-6 px-2 rounded text-[11px] font-medium transition-all ${
                          active
                            ? 'bg-[#1a1a1a] text-white'
                            : 'bg-[#f5f6f8] text-[#666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-[10px] text-[#999891]">No scope selected — applies to all segments.</p>
      )}
    </div>
  );
}

// ─── TEMPLATE REVIEW / EDIT MODE ───────────────────────
function TemplateReviewMode({
  prefill,
  onClose,
  onSave,
}: {
  prefill: TriggerPrefill;
  onClose: () => void;
  onSave?: () => void;
}) {
  const [name, setName] = useState(prefill.name);
  const [condition, setCondition] = useState(prefill.condition);
  const [approvers, setApprovers] = useState<string[]>(prefill.approvers);
  const [segments, setSegments] = useState<string[]>(prefill.segments);
  const [category, setCategory] = useState(prefill.category);
  const [approverInput, setApproverInput] = useState('');
  const [showApproverSuggestions, setShowApproverSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const removeApprover = (idx: number) => setApprovers(prev => prev.filter((_, i) => i !== idx));

  const addApprover = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !approvers.includes(trimmed)) {
      setApprovers(prev => [...prev, trimmed]);
    }
    setApproverInput('');
    setShowApproverSuggestions(false);
  };

  const filteredApproverSuggestions = KNOWN_APPROVERS.filter(
    a => !approvers.includes(a) && a.toLowerCase().includes(approverInput.toLowerCase())
  );

  const handleSave = async () => {
    if (!name.trim() || !condition.trim() || approvers.length === 0) {
      toast.error('Please fill in the rule name, condition, and at least one approver.');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      saveTrigger({
        name: name.trim(),
        when: condition.trim(),
        then: approvers,
        scope: segments.length > 0 ? segments : ['All segments'],
        status: 'active',
        category,
        impact: { deals: 0, avgTime: '\u2014' },
        fromTemplate: prefill.templateName,
      });

      toast.success(`Trigger "${name.trim()}" created`, {
        description: "It's now live in Approval Triggers.",
      });
      onSave?.();
      onClose();
    } catch {
      toast.error('Failed to create trigger.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-[480px] min-w-[380px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-5 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight">Create from Template</h2>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
              <X className="w-3.5 h-3.5 text-[#999891]" />
            </button>
          </div>
          <p className="text-[11px] text-[#999891] mt-0.5">Review and customize this template, then save.</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Template source */}
            <div className="px-3 py-2.5 bg-[#f9fafb] border border-[#f0f1f4] rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#1a1a1a] flex-shrink-0" />
                <span className="text-[10px] font-semibold text-[#999891] uppercase tracking-wider">From Template</span>
              </div>
              <div className="text-[12px] font-medium text-[#1a1a1a] leading-snug">{prefill.templateName}</div>
              <div className="text-[11px] text-[#999891] mt-0.5 leading-relaxed">{prefill.templateDescription}</div>
            </div>

            {/* Rule Name */}
            <div>
              <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Rule Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 px-2.5 border border-[#e2e0d8] rounded-md bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Condition */}
            <div>
              <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Condition (When)</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-8 px-2.5 border border-[#e2e0d8] rounded-md bg-white text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
              />
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Approvers */}
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-2.5">Approval Chain</label>
              {approvers.length > 0 && (
                <div className="space-y-1.5 mb-2.5">
                  {approvers.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <span className="w-5 h-5 rounded-full bg-[#f5f6f8] border border-[#e2e0d8] flex items-center justify-center text-[10px] font-medium text-[#666666] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="flex-1 h-7 px-2.5 border border-[#e2e0d8] rounded-md bg-[#f9fafb] text-[12px] text-[#1a1a1a] flex items-center">
                        {a}
                      </span>
                      <button
                        onClick={() => removeApprover(idx)}
                        className="p-1 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={approverInput}
                  onChange={(e) => { setApproverInput(e.target.value); setShowApproverSuggestions(true); }}
                  onFocus={() => setShowApproverSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowApproverSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && approverInput.trim()) {
                      e.preventDefault();
                      addApprover(approverInput);
                    }
                  }}
                  placeholder="Add approver..."
                  className="w-full h-8 px-2.5 border border-[#e2e0d8] rounded-md bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors placeholder:text-[#999891]"
                />
                {showApproverSuggestions && filteredApproverSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e2e0d8] rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredApproverSuggestions.map(a => (
                      <button
                        key={a}
                        onMouseDown={(e) => { e.preventDefault(); addApprover(a); }}
                        className="w-full text-left px-2.5 py-1.5 text-[12px] text-[#1a1a1a] hover:bg-[#f9fafb] transition-colors"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Segments */}
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-2.5">Scope</label>
              <ScopePicker selected={segments} onChange={setSegments} />
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1.5">Category</label>
              <div className="flex gap-1.5">
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-all ${
                      category === opt.value
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="px-3 py-2.5 bg-[#f9fafb] border border-[#f0f1f4] rounded-md">
              <div className="text-[10px] font-semibold text-[#999891] uppercase tracking-wider mb-1.5">Preview</div>
              <p className="text-[12px] text-[#1a1a1a] leading-relaxed">
                When <span className="font-semibold">{condition || '\u2026'}</span>, require approval from{' '}
                <span className="font-semibold">{approvers.length > 0 ? approvers.join(' \u2192 ') : '\u2026'}</span>
                {segments.length > 0 && segments[0] !== 'All segments' && (
                  <span className="text-[#999891]"> for {segments.join(', ')}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-5 py-2.5 flex items-center justify-end gap-2">
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
                <Check className="w-3 h-3" />
                Save Trigger
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
