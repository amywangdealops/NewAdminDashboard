import { X, Loader2, Plus, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  type Term,
  type TermFormData,
  SEGMENTS,
  CATEGORIES,
  INPUT_TYPES,
  getDefaultTerm,
} from './termStore';

type DrawerMode = 'add' | 'edit' | 'duplicate';

interface TermFormDrawerProps {
  mode: DrawerMode;
  term?: Term | null;
  onClose: () => void;
  onSave: (data: TermFormData) => void;
  onDelete?: (term: Term) => void;
}

export function TermFormDrawer({ mode, term, onClose, onSave, onDelete }: TermFormDrawerProps) {
  const initData = (): TermFormData => {
    if (mode === 'edit' && term) {
      const { id, createdAt, ...rest } = term;
      return rest;
    }
    if (mode === 'duplicate' && term) {
      const { id, createdAt, ...rest } = term;
      return { ...rest, name: `${term.name} (Copy)` };
    }
    return getDefaultTerm();
  };

  const [form, setForm] = useState<TermFormData>(initData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showOrderFormNote, setShowOrderFormNote] = useState(!!form.orderFormNote);
  const [newOption, setNewOption] = useState('');

  const set = <K extends keyof TermFormData>(key: K, value: TermFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Term name is required';
    if (!form.inputType) errs.inputType = 'Input type is required';
    if ((form.inputType === 'Select' || form.inputType === 'Select With Other') && form.options.length === 0) {
      errs.options = 'At least one option is required for select types';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      onSave(form);
    } catch {
      toast.error('Failed to save term. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (form.options.includes(trimmed)) {
      toast.error('Option already exists');
      return;
    }
    set('options', [...form.options, trimmed]);
    setNewOption('');
  };

  const handleRemoveOption = (opt: string) => {
    set('options', form.options.filter(o => o !== opt));
  };

  const segmentsDisplay = form.segments.length === 0 ? 'All segments (default)' : form.segments.join(', ');
  const showOptions = form.inputType === 'Select' || form.inputType === 'Select With Other';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-5 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">
              {mode === 'edit' && term ? term.name : mode === 'add' ? 'New Term' : 'Duplicate Term'}
            </h2>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
              <X className="w-3.5 h-3.5 text-[#999891]" />
            </button>
          </div>
          {mode === 'edit' ? (
            <div className="mt-1.5">
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Add description"
                rows={1}
                className="w-full px-2.5 py-1 border border-[#e2e0d8] rounded-md text-[12px] text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[28px] transition-colors placeholder:text-[#999891]"
              />
            </div>
          ) : (
            <p className="text-[11px] text-[#999891] mt-0.5">
              {mode === 'add' ? 'Configure a new term for order forms' : 'Create a copy with new settings'}
            </p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Term Name (add/duplicate only) */}
            {mode !== 'edit' && (
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">
                  Term Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Payment Terms"
                  className="w-full h-9 px-3 border border-[#e2e0d8] rounded-md text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors placeholder:text-[#999891]"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Input Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">Input Type</label>
                <select
                  value={form.inputType}
                  onChange={(e) => set('inputType', e.target.value as Term['inputType'])}
                  className="custom-select w-full h-9 pl-3 pr-8 border border-[#e2e0d8] rounded-md bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                >
                  {INPUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.inputType && <p className="text-[11px] text-red-600 mt-1">{errors.inputType}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as Term['status'])}
                  className="custom-select w-full h-9 pl-3 pr-8 border border-[#e2e0d8] rounded-md bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                >
                  <option value="On">On</option>
                  <option value="Off">Off</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value as Term['category'])}
                className="custom-select w-full h-9 pl-3 pr-8 border border-[#e2e0d8] rounded-md bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Segments */}
            <div>
              <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">Segments</label>
              <select
                value={form.segments.length === 0 ? '' : form.segments[0]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val || val === 'All segments') {
                    set('segments', []);
                  } else {
                    set('segments', [val]);
                  }
                }}
                className="custom-select w-full h-9 pl-3 pr-8 border border-[#e2e0d8] rounded-md bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
              >
                {SEGMENTS.map(s => (
                  <option key={s} value={s === 'All segments' ? '' : s}>
                    {s === 'All segments' ? 'All segments (default)' : s}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#999891] mt-1">Leave empty to show term for all segments</p>
            </div>

            {/* Options (for Select types) */}
            {showOptions && (
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">
                  Options <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {form.options.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="flex-1 h-8 px-3 border border-[#e2e0d8] rounded-md bg-[#f9fafb] text-[12px] text-[#1a1a1a] flex items-center">{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt)}
                        className="p-1.5 text-[#999891] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      placeholder="Add option..."
                      className="flex-1 h-8 px-3 border border-[#e2e0d8] rounded-md text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors placeholder:text-[#999891]"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="h-8 px-2.5 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[12px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
                {errors.options && <p className="text-[11px] text-red-600 mt-1">{errors.options}</p>}
              </div>
            )}

            {/* Description (add/duplicate only) */}
            {mode !== 'edit' && (
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[#e2e0d8] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[60px] transition-colors placeholder:text-[#999891]"
                />
              </div>
            )}

            {/* Order Form Note */}
            {!showOrderFormNote ? (
              <button
                type="button"
                onClick={() => setShowOrderFormNote(true)}
                className="text-[13px] text-[#96854a] hover:text-[#7a6c3c] font-medium transition-colors"
              >
                + Add order form note (optional)
              </button>
            ) : (
              <div>
                <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">Order Form Note</label>
                <textarea
                  value={form.orderFormNote}
                  onChange={(e) => set('orderFormNote', e.target.value)}
                  placeholder="Note displayed on order form..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[#e2e0d8] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[60px] transition-colors placeholder:text-[#999891]"
                />
              </div>
            )}

            {/* Order Form Tags */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-1">Order Form Tags</h3>
              <p className="text-[11px] text-[#999891] mb-3">Use these tags in your order form template</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#666666] mb-1">Value Tag</label>
                  <div className="relative">
                    <div className="h-9 px-3 border border-[#e2e0d8] rounded-md bg-[#f9fafb] text-[12px] font-mono text-[#666666] flex items-center pr-8 overflow-hidden">
                      <span className="truncate">{`{{${form.name || 'Term Name'} Value}}`}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(`{{${form.name} Value}}`); toast.success('Copied!'); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#999891] hover:text-[#333333] transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#666666] mb-1">Note Tag</label>
                  <div className="relative">
                    <div className="h-9 px-3 border border-[#e2e0d8] rounded-md bg-[#f9fafb] text-[12px] font-mono text-[#666666] flex items-center pr-8 overflow-hidden">
                      <span className="truncate">{`{{${form.name || 'Term Name'} Note}}`}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(`{{${form.name} Note}}`); toast.success('Copied!'); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#999891] hover:text-[#333333] transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-5 py-2.5 flex items-center justify-between">
          <div>
            {mode === 'edit' && term && onDelete && (
              <button
                onClick={() => { onDelete(term); }}
                className="h-8 px-3 text-[#333333] text-[12px] font-medium transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 inline-flex items-center gap-1.5"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mode !== 'edit' && (
              <button
                onClick={onClose}
                className="h-8 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-4 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
