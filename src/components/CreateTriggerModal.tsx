import { X, ChevronRight, Check, Info } from 'lucide-react';
import { useState } from 'react';

interface CreateTriggerModalProps {
  onClose: () => void;
}

export function CreateTriggerModal({ onClose }: CreateTriggerModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [triggerConfig, setTriggerConfig] = useState<any>({});

  const triggerTypes = [
    {
      id: 'discount',
      icon: '💰',
      title: 'Discount exceeds threshold',
      description: 'Require approval when discount percentage or amount is too high',
      examples: ['Discount > 20%', 'Discount > $10,000', 'Discount on enterprise deals']
    },
    {
      id: 'payment-terms',
      icon: '📄',
      title: 'Contract term selected',
      description: 'Require approval for specific payment terms or billing frequencies',
      examples: ['Net 90 payment terms', 'Upfront billing', 'Multi-year contracts']
    },
    {
      id: 'renewal',
      icon: '🔁',
      title: 'Renewal / auto-renewal change',
      description: 'Require approval when renewal settings are modified',
      examples: ['Auto-renewal disabled', 'Early renewal', 'Renewal discount applied']
    },
    {
      id: 'pricing-override',
      icon: '🧾',
      title: 'Pricing model override',
      description: 'Require approval for custom pricing or non-standard models',
      examples: ['Custom pricing', 'Volume pricing', 'Special contract rates']
    },
    {
      id: 'custom',
      icon: '⚙️',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#050038]">Create Approval Trigger</h2>
            <p className="text-sm text-[#6c757d] mt-0.5">
              {step === 1 && "What scenario should trigger an approval?"}
              {step === 2 && "When should this trigger fire?"}
              {step === 3 && "Who needs to approve?"}
              {step === 4 && "Review and confirm"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6c757d]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepIndicator()}

          {/* Step 1: What happened? */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">What happened?</h3>
              <p className="text-sm text-[#6c757d] mb-6">
                Choose the type of event that should trigger an approval
              </p>

              <div className="space-y-3">
                {triggerTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${selectedType === type.id 
                        ? 'border-[#4262FF] bg-[#f0f4ff]' 
                        : 'border-[#e1e4e8] hover:border-[#4262FF]/30 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{type.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[#050038]">{type.title}</h4>
                          {selectedType === type.id && (
                            <Check className="w-4 h-4 text-[#4262FF]" />
                          )}
                        </div>
                        <p className="text-sm text-[#6c757d] mb-2">{type.description}</p>
                        
                        {/* Expandable examples */}
                        {selectedType === type.id && (
                          <div className="mt-3 pt-3 border-t border-[#e1e4e8]">
                            <div className="text-xs text-[#6c757d] mb-2 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Common use cases:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {type.examples.map((ex, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-[#e1e4e8] rounded text-xs text-[#050038]">
                                  {ex}
                                </span>
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

          {/* Step 2: When should this trigger? */}
          {step === 2 && selectedType && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">When should this trigger?</h3>
              <p className="text-sm text-[#6c757d] mb-6">
                Define the specific condition that activates this approval
              </p>

              {selectedType === 'discount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">
                      Discount threshold
                    </label>
                    <div className="flex gap-3">
                      <select className="flex-1 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                        <option>Greater than</option>
                        <option>Greater than or equal to</option>
                        <option>Equal to</option>
                      </select>
                      <input
                        type="number"
                        placeholder="20"
                        className="w-24 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                      />
                      <select className="w-20 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                        <option>%</option>
                        <option>$</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">
                      Apply to segments (optional)
                    </label>
                    <select className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
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
                    <label className="block text-sm font-medium text-[#050038] mb-2">
                      Payment term
                    </label>
                    <select className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>Net 90</option>
                      <option>Upfront</option>
                      <option>Custom terms</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#050038] mb-2">
                      Apply to segments (optional)
                    </label>
                    <select className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                      <option>All segments</option>
                      <option>Enterprise only</option>
                      <option>Mid-Market only</option>
                      <option>SMB only</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Preview Box */}
              <div className="mt-6 p-4 bg-[#f0f4ff] border border-[#4262FF]/20 rounded-lg">
                <div className="text-xs text-[#4262FF] font-medium mb-2">PREVIEW</div>
                <div className="text-sm text-[#050038]">
                  {selectedType === 'discount' && "Triggers when Discount > 20% for All segments"}
                  {selectedType === 'payment-terms' && "Triggers when Payment Terms = Net 90 for All segments"}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Who approves? */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">Who needs to approve?</h3>
              <p className="text-sm text-[#6c757d] mb-6">
                Select approval groups and set escalation rules
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#050038] mb-2">
                    Primary approver group
                  </label>
                  <select className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm">
                    <option>Deal Desk</option>
                    <option>Finance Team</option>
                    <option>Sales Management</option>
                    <option>VP of Sales</option>
                    <option>Legal Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#050038] mb-2">
                    Required approvals
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                  />
                  <p className="text-xs text-[#6c757d] mt-1">Number of approvals needed from this group</p>
                </div>

                <div className="pt-4 border-t border-[#e1e4e8]">
                  <button className="text-sm text-[#4262FF] hover:underline font-medium">
                    + Add escalation approver
                  </button>
                  <p className="text-xs text-[#6c757d] mt-1">Optional: require additional approval if conditions are met</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-[#050038] mb-2">Review and confirm</h3>
              <p className="text-sm text-[#6c757d] mb-6">
                Make sure everything looks correct before saving
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-[#f8f9fa] border border-[#e1e4e8] rounded-lg">
                  <h4 className="text-sm font-semibold text-[#050038] mb-3">Plain English Summary</h4>
                  <p className="text-sm text-[#050038] leading-relaxed">
                    If a rep sets <span className="font-semibold">Discount &gt; 20%</span> on a deal for{' '}
                    <span className="font-semibold">All segments</span>, approval is required from{' '}
                    <span className="font-semibold">Deal Desk</span> (1 approval needed).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white border border-[#e1e4e8] rounded-lg">
                    <div className="text-lg">💰</div>
                    <div>
                      <div className="text-xs text-[#6c757d]">TRIGGER TYPE</div>
                      <div className="text-sm font-medium text-[#050038]">Discount exceeds threshold</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-[#e1e4e8] rounded-lg">
                    <div className="text-lg">⚙️</div>
                    <div>
                      <div className="text-xs text-[#6c757d]">CONDITION</div>
                      <div className="text-sm font-medium text-[#050038]">Discount &gt; 20% for All segments</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-[#e1e4e8] rounded-lg">
                    <div className="text-lg">👥</div>
                    <div>
                      <div className="text-xs text-[#6c757d]">APPROVERS</div>
                      <div className="text-sm font-medium text-[#050038]">Deal Desk (1 approval required)</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#050038] mb-2">
                    Trigger name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="High Discount Approval"
                    className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                  />
                  <p className="text-xs text-[#6c757d] mt-1">Leave blank to auto-generate from conditions</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 text-[#6c757d] hover:text-[#050038] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#050038] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !selectedType}
                className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
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
