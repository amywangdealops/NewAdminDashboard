import { X, Shield, Save, Trash2, Users, FileText, Settings, DollarSign, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Trigger {
  id: number;
  name: string;
  icon: any;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  impact: { deals: number; avgTime: string };
  category: string;
}

interface ViewTriggerModalProps {
  trigger: Trigger;
  onClose: () => void;
  onSave?: (updatedTrigger: Trigger) => void;
  onDelete?: (triggerId: number) => void;
}

export function ViewTriggerModal({ trigger, onClose, onSave, onDelete }: ViewTriggerModalProps) {
  const [editedTrigger, setEditedTrigger] = useState<Trigger>({ ...trigger });
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      if (onSave) {
        onSave(editedTrigger);
      }
      toast.success(`Trigger "${editedTrigger.name}" saved successfully`);
      onClose();
    } catch (error) {
      toast.error('Failed to save trigger. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${editedTrigger.name}"?`)) {
      return;
    }
    try {
      if (onDelete) {
        onDelete(editedTrigger.id);
      }
      toast.success(`Trigger "${editedTrigger.name}" deleted successfully`);
      onClose();
    } catch (error) {
      toast.error('Failed to delete trigger. Please try again.');
    }
  };

  const renderIcon = () => {
    const IconComponent = editedTrigger.icon;
    return <IconComponent className="w-5 h-5 text-[#4262FF]" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {renderIcon()}
            <div>
              <h2 className="text-xl font-semibold text-[#050038]">{editedTrigger.name}</h2>
              <p className="text-sm text-[#6c757d] mt-0.5">View and edit trigger configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6c757d]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">Add description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this trigger..."
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm min-h-[80px] resize-y"
            />
          </div>

          {/* Condition (When) */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">Condition (When)</label>
            <input
              type="text"
              value={editedTrigger.when}
              onChange={(e) => setEditedTrigger({ ...editedTrigger, when: e.target.value })}
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
              placeholder="e.g., Discount > 20%"
            />
          </div>

          {/* Approvers (Then) */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">Approvers (Then)</label>
            <div className="space-y-2">
              {editedTrigger.then.map((approver, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={approver}
                    onChange={(e) => {
                      const newThen = [...editedTrigger.then];
                      newThen[idx] = e.target.value;
                      setEditedTrigger({ ...editedTrigger, then: newThen });
                    }}
                    className="flex-1 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                    placeholder="Approver group name"
                  />
                  {editedTrigger.then.length > 1 && (
                    <button
                      onClick={() => {
                        const newThen = editedTrigger.then.filter((_, i) => i !== idx);
                        setEditedTrigger({ ...editedTrigger, then: newThen });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  setEditedTrigger({ ...editedTrigger, then: [...editedTrigger.then, ''] });
                }}
                className="text-sm text-[#4262FF] hover:underline font-medium"
              >
                + Add approver
              </button>
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">Scope</label>
            <div className="space-y-2">
              {editedTrigger.scope.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => {
                      const newScope = [...editedTrigger.scope];
                      newScope[idx] = e.target.value;
                      setEditedTrigger({ ...editedTrigger, scope: newScope });
                    }}
                    className="flex-1 px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
                    placeholder="e.g., Enterprise, US"
                  />
                  {editedTrigger.scope.length > 1 && (
                    <button
                      onClick={() => {
                        const newScope = editedTrigger.scope.filter((_, i) => i !== idx);
                        setEditedTrigger({ ...editedTrigger, scope: newScope });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  setEditedTrigger({ ...editedTrigger, scope: [...editedTrigger.scope, ''] });
                }}
                className="text-sm text-[#4262FF] hover:underline font-medium"
              >
                + Add scope
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">Status</label>
            <select
              value={editedTrigger.status}
              onChange={(e) => setEditedTrigger({ ...editedTrigger, status: e.target.value as 'active' | 'paused' })}
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#050038] mb-2">Category</label>
            <select
              value={editedTrigger.category}
              onChange={(e) => setEditedTrigger({ ...editedTrigger, category: e.target.value })}
              className="w-full px-3 py-2 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm"
            >
              <option value="pricing">Pricing & Discounts</option>
              <option value="terms">Commercial Terms</option>
              <option value="custom">Custom Triggers</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#050038] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

