import { X, ChevronRight, Check, Info, DollarSign, FileText, RefreshCw, Receipt, Settings, Users, Plus, Layers } from 'lucide-react';
import { useState } from 'react';
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
  category: string; // 'pricing' | 'terms' | 'custom'
}

interface CreateTriggerModalProps {
  onClose: () => void;
  onSave?: () => void;
  prefill?: TriggerPrefill;
}

const KNOWN_APPROVERS = [
  'Deal Desk', 'Deal Ops', 'Finance', 'VP of Sales', 'VP of Sales (EMEA)',
  'Head of Mid-Market', 'Legal', 'Customer Success', 'Product Team', 'Engineering', 'CFO',
];

const KNOWN_SEGMENTS = [
  'All segments', 'Enterprise', 'Mid-Market', 'SMB', 'EMEA', 'US',
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'pricing', label: 'Product Discounts' },
  { value: 'terms', label: 'Commercial Terms' },
  { value: 'custom', label: 'Custom Triggers' },
];

// ─── MAIN COMPONENT ────────────────────────────────────
export function CreateTriggerModal({ onClose, onSave, prefill }: CreateTriggerModalProps) {
  if (prefill) {
    return <TemplateReviewMode prefill={prefill} onClose={onClose} onSave={onSave} />;
  }
  return <WizardMode onClose={onClose} onSave={onSave} />;
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
  const [segmentInput, setSegmentInput] = useState('');
  const [showApproverSuggestions, setShowApproverSuggestions] = useState(false);
  const [showSegmentSuggestions, setShowSegmentSuggestions] = useState(false);

  const removeApprover = (idx: number) => setApprovers(prev => prev.filter((_, i) => i !== idx));
  const removeSegment = (idx: number) => setSegments(prev => prev.filter((_, i) => i !== idx));

  const addApprover = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !approvers.includes(trimmed)) {
      setApprovers(prev => [...prev, trimmed]);
    }
    setApproverInput('');
    setShowApproverSuggestions(false);
  };

  const addSegment = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !segments.includes(trimmed)) {
      setSegments(prev => [...prev, trimmed]);
    }
    setSegmentInput('');
    setShowSegmentSuggestions(false);
  };

  const filteredApproverSuggestions = KNOWN_APPROVERS.filter(
    a => !approvers.includes(a) && a.toLowerCase().includes(approverInput.toLowerCase())
  );

  const filteredSegmentSuggestions = KNOWN_SEGMENTS.filter(
    s => !segments.includes(s) && s.toLowerCase().includes(segmentInput.toLowerCase())
  );

  const handleSave = () => {
    if (!name.trim() || !condition.trim() || approvers.length === 0) {
      toast.error('Please fill in the rule name, condition, and at least one approver.');
      return;
    }

    saveTrigger({
      name: name.trim(),
      when: condition.trim(),
      then: approvers,
      scope: segments.length > 0 ? segments : ['All segments'],
      status: 'active',
      category,
      impact: { deals: 0, avgTime: '—' },
      fromTemplate: prefill.templateName,
    });

    toast.success(`Trigger "${name.trim()}" created`, {
      description: "It's now live in Approval Triggers.",
    });
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#050038]">Create Approval Trigger</h2>
            <p className="text-sm text-[#6c757d] mt-0.5">Review and customize this template, then save.</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6c757d]" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Template source */}
          <div className="p-4 bg-[#f8f9fa] border border-[#e1e4e8] rounded-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-[#4262FF] flex-shrink-0" />
              <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">From Template</span>
            </div>
            <div className="text-sm font-medium text-[#050038] mb-1 leading-snug">{prefill.templateName}</div>
            <div className="text-xs text-[#6c757d] leading-relaxed">{prefill.templateDescription}</div>
          </div>

          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-1.5">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
            />
            <p className="text-[11px] text-[#9ca3af] mt-1">This is the display name shown in the triggers list.</p>
          </div>

          {/* Condition / When */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-1.5">When (Condition)</label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm font-mono"
            />
            <p className="text-[11px] text-[#9ca3af] mt-1">The condition that fires this trigger, e.g. "Discount &gt; 20%"</p>
          </div>

          {/* Approvers */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-1.5">Then Require Approval From</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {approvers.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fff3e0] text-[#e65100] rounded-md text-xs font-medium"
                >
                  {a}
                  <button
                    onClick={() => removeApprover(i)}
                    className="hover:bg-[#e65100]/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
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
                placeholder="Type to add approver…"
                className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
              />
              {showApproverSuggestions && filteredApproverSuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e1e4e8] rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredApproverSuggestions.map(a => (
                    <button
                      key={a}
                      onMouseDown={(e) => { e.preventDefault(); addApprover(a); }}
                      className="w-full text-left px-3 py-2 text-sm text-[#050038] hover:bg-[#f0f4ff] transition-colors"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {approvers.length > 1 && (
              <p className="text-[11px] text-[#9ca3af] mt-1">Approvals are sequential: {approvers.join(' → ')}</p>
            )}
          </div>

          {/* Segments */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-1.5">Applies to Segments</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {segments.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f0f0f0] text-[#6c757d] rounded-md text-xs font-medium"
                >
                  {s}
                  <button
                    onClick={() => removeSegment(i)}
                    className="hover:bg-[#6c757d]/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={segmentInput}
                onChange={(e) => { setSegmentInput(e.target.value); setShowSegmentSuggestions(true); }}
                onFocus={() => setShowSegmentSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSegmentSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && segmentInput.trim()) {
                    e.preventDefault();
                    addSegment(segmentInput);
                  }
                }}
                placeholder="Type to add segment…"
                className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
              />
              {showSegmentSuggestions && filteredSegmentSuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e1e4e8] rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredSegmentSuggestions.map(s => (
                    <button
                      key={s}
                      onMouseDown={(e) => { e.preventDefault(); addSegment(s); }}
                      className="w-full text-left px-3 py-2 text-sm text-[#050038] hover:bg-[#f0f4ff] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Live Preview */}
          <div className="p-4 bg-[#f0f4ff] border border-[#4262FF]/20 rounded-lg">
            <div className="text-[10px] font-semibold text-[#4262FF] uppercase tracking-wider mb-2">Live Preview</div>
            <p className="text-sm text-[#050038] leading-relaxed">
              When <span className="font-semibold">{condition || '…'}</span>, require approval from{' '}
              <span className="font-semibold">{approvers.length > 0 ? approvers.join(' → ') : '…'}</span>
              {segments.length > 0 && segments[0] !== 'All segments' && (
                <span className="text-[#6c757d]"> for {segments.join(', ')}</span>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e1e4e8] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#050038] text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            Save Trigger
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WIZARD MODE (existing step-by-step flow) ──────────
function WizardMode({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Tracked form state for saving
  const [discountOperator, setDiscountOperator] = useState('Greater than');
  const [discountValue, setDiscountValue] = useState('20');
  const [discountUnit, setDiscountUnit] = useState('%');
  const [paymentTerm, setPaymentTerm] = useState('Net 90');
  const [segment, setSegment] = useState('All segments');
  const [approverGroup, setApproverGroup] = useState('Deal Desk');
  const [requiredApprovals, setRequiredApprovals] = useState('1');
  const [triggerName, setTriggerName] = useState('');

  const triggerTypes = [
    {
      id: 'discount',
      icon: DollarSign,
      title: 'Discount exceeds threshold',
      description: 'Require approval when discount percentage or amount is too high',
      examples: ['Discount > 20%', 'Discount > $10,000', 'Discount on enterprise deals']
    },
    {
      id: 'payment-terms',
      icon: FileText,
      title: 'Contract term selected',
      description: 'Require approval for specific payment terms or billing frequencies',
      examples: ['Net 90 payment terms', 'Upfront billing', 'Multi-year contracts']
    },
    {
      id: 'renewal',
      icon: RefreshCw,
      title: 'Renewal / auto-renewal change',
      description: 'Require approval when renewal settings are modified',
      examples: ['Auto-renewal disabled', 'Early renewal', 'Renewal discount applied']
    },
    {
      id: 'pricing-override',
      icon: Receipt,
      title: 'Pricing model override',
      description: 'Require approval for custom pricing or non-standard models',
      examples: ['Custom pricing', 'Volume pricing', 'Special contract rates']
    },
    {
      id: 'custom',
      icon: Settings,
      title: 'Custom condition',
      description: 'Create your own approval condition from scratch',
      examples: ['Deal size threshold', 'Region-specific rules', 'Product combinations']
    },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Build condition text from form values
  const getConditionText = () => {
    if (selectedType === 'discount') return `Discount ${discountOperator === 'Greater than' ? '>' : discountOperator === 'Greater than or equal to' ? '≥' : '='} ${discountValue}${discountUnit}`;
    if (selectedType === 'payment-terms') return `Payment Terms = ${paymentTerm}`;
    if (selectedType === 'renewal') return 'Auto-renewal = Off';
    if (selectedType === 'pricing-override') return 'Custom pricing override';
    return 'Custom condition';
  };

  const getCategoryForType = () => {
    if (selectedType === 'discount' || selectedType === 'pricing-override') return 'pricing';
    if (selectedType === 'payment-terms' || selectedType === 'renewal') return 'terms';
    return 'custom';
  };

  const handleSaveTrigger = () => {
    const conditionText = getConditionText();
    const finalName = triggerName.trim() || `${approverGroup} — ${conditionText}`;

    saveTrigger({
      name: finalName,
      when: conditionText,
      then: [approverGroup],
      scope: [segment],
      status: 'active',
      category: getCategoryForType(),
      impact: { deals: 0, avgTime: '—' },
    });

    toast.success(`Trigger "${finalName}" created`, {
      description: "It's now live in Approval Triggers.",
    });
    onSave?.();
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
            ${s < step ? 'bg-[#4262FF] text-white' : ''}
            ${s === step ? 'bg-[#4262FF] text-white ring-4 ring-[#4262FF]/20' : ''}
            ${s > step ? 'bg-[#e1e4e8] text-[#6c757d]' : ''}
          `}>
            {s < step ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 4 && (
            <div className={`w-12 h-0.5 ${s < step ? 'bg-[#4262FF]' : 'bg-[#e1e4e8]'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-xl shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e1e4e8] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-[#050038]">Create Approval Trigger</h2>
            <p className="text-sm text-[#6c757d] mt-0.5">
              {step === 1 && "What scenario should trigger an approval?"}
              {step === 2 && "When should this trigger fire?"}
              {step === 3 && "Who needs to approve?"}
              {step === 4 && "Review and confirm"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6c757d]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepIndicator()}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">What happened?</h3>
              <p className="text-sm text-[#6c757d] mb-6">Choose the type of event that should trigger an approval</p>
              <div className="space-y-3">
                {triggerTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedType === type.id ? 'border-[#4262FF] bg-[#f0f4ff]' : 'border-[#e1e4e8] hover:border-[#4262FF]/30 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {type.icon && <type.icon className="w-6 h-6 text-[#4262FF] mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[#050038]">{type.title}</h4>
                          {selectedType === type.id && <Check className="w-4 h-4 text-[#4262FF]" />}
                        </div>
                        <p className="text-sm text-[#6c757d] mb-2">{type.description}</p>
                        {selectedType === type.id && (
                          <div className="mt-3 pt-3 border-t border-[#e1e4e8]">
                            <div className="text-xs text-[#6c757d] mb-2 flex items-center gap-1">
                              <Info className="w-3 h-3" /> Common use cases:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {type.examples.map((ex, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-[#e1e4e8] rounded text-xs text-[#050038]">{ex}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && selectedType && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">When should this trigger?</h3>
              <p className="text-sm text-[#6c757d] mb-6">Define the specific condition that activates this approval</p>

              {selectedType === 'discount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">Discount threshold</label>
                    <div className="flex gap-3">
                      <select value={discountOperator} onChange={e => setDiscountOperator(e.target.value)} className="flex-1 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                        <option>Greater than</option>
                        <option>Greater than or equal to</option>
                        <option>Equal to</option>
                      </select>
                      <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="20" className="w-24 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm" />
                      <select value={discountUnit} onChange={e => setDiscountUnit(e.target.value)} className="w-20 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                        <option>%</option>
                        <option>$</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">Apply to segments (optional)</label>
                    <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                      <option>All segments</option>
                      <option>Enterprise only</option>
                      <option>Mid-Market only</option>
                      <option>SMB only</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedType === 'payment-terms' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">Payment term</label>
                    <select value={paymentTerm} onChange={e => setPaymentTerm(e.target.value)} className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                      <option>Net 30</option>
                      <option>Net 45</option>
                      <option>Net 60</option>
                      <option>Net 90</option>
                      <option>Upfront</option>
                      <option>Custom terms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">Apply to segments (optional)</label>
                    <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                      <option>All segments</option>
                      <option>Enterprise only</option>
                      <option>Mid-Market only</option>
                      <option>SMB only</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="mt-6 p-4 bg-[#f0f4ff] border border-[#4262FF]/20 rounded-lg">
                <div className="text-xs text-[#4262FF] font-medium mb-2">PREVIEW</div>
                <div className="text-sm text-[#050038]">
                  Triggers when {getConditionText()} for {segment}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">Who needs to approve?</h3>
              <p className="text-sm text-[#6c757d] mb-6">Select approval groups and set escalation rules</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#050038] mb-2">Primary approver group</label>
                  <select value={approverGroup} onChange={e => setApproverGroup(e.target.value)} className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                    <option>Deal Desk</option>
                    <option>Finance</option>
                    <option>VP of Sales</option>
                    <option>Head of Mid-Market</option>
                    <option>Legal</option>
                    <option>Customer Success</option>
                    <option>Product Team</option>
                    <option>Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#050038] mb-2">Required approvals</label>
                  <input
                    type="number"
                    min="1"
                    value={requiredApprovals}
                    onChange={e => setRequiredApprovals(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                  />
                  <p className="text-xs text-[#6c757d] mt-1">Number of approvals needed from this group</p>
                </div>
                <div className="pt-4 border-t border-[#e1e4e8]">
                  <button className="text-sm text-[#4262FF] hover:underline font-medium">+ Add escalation approver</button>
                  <p className="text-xs text-[#6c757d] mt-1">Optional: require additional approval if conditions are met</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">Review and confirm</h3>
              <p className="text-sm text-[#6c757d] mb-6">Make sure everything looks correct before saving</p>
              <div className="space-y-4">
                <div className="p-4 bg-[#f8f9fa] border border-[#e1e4e8] rounded-lg">
                  <h4 className="text-sm font-semibold text-[#050038] mb-3">Plain English Summary</h4>
                  <p className="text-sm text-[#050038] leading-relaxed">
                    If a rep sets <span className="font-semibold">{getConditionText()}</span> on a deal for{' '}
                    <span className="font-semibold">{segment}</span>, approval is required from{' '}
                    <span className="font-semibold">{approverGroup}</span> ({requiredApprovals} approval needed).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white border border-[#e1e4e8] rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#4262FF] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-[#6c757d]">TRIGGER TYPE</div>
                      <div className="text-sm font-medium text-[#050038]">{triggerTypes.find(t => t.id === selectedType)?.title}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white border border-[#e1e4e8] rounded-lg">
                    <Settings className="w-5 h-5 text-[#4262FF] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-[#6c757d]">CONDITION</div>
                      <div className="text-sm font-medium text-[#050038]">{getConditionText()} for {segment}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white border border-[#e1e4e8] rounded-lg">
                    <Users className="w-5 h-5 text-[#4262FF] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-[#6c757d]">APPROVERS</div>
                      <div className="text-sm font-medium text-[#050038]">{approverGroup} ({requiredApprovals} approval required)</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#050038] mb-2">Trigger name (optional)</label>
                  <input
                    type="text"
                    value={triggerName}
                    onChange={e => setTriggerName(e.target.value)}
                    placeholder={`${approverGroup} — ${getConditionText()}`}
                    className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                  />
                  <p className="text-xs text-[#6c757d] mt-1">Leave blank to auto-generate from conditions</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#e1e4e8] px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="h-9 px-4 text-[#6c757d] hover:text-[#050038] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors inline-flex items-center"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="h-9 px-4 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#050038] text-sm font-medium transition-colors inline-flex items-center focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20">
              Cancel
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !selectedType}
                className="h-9 px-4 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveTrigger}
                className="h-9 px-4 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] inline-flex items-center gap-2 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
              >
                <Check className="w-4 h-4" />
                Save Trigger
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
