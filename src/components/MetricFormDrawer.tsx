import { X, Save, ChevronDown, ChevronUp, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  type Metric,
  type MetricFormData,
  type MetricType,
  type CalculationMethod,
  type MetricFormat,
  type DataSource,
  type DealType,
  DEAL_TYPES,
  getDefaultMetric,
} from './metricStore';

type DrawerMode = 'add' | 'edit' | 'duplicate';

interface MetricFormDrawerProps {
  mode: DrawerMode;
  metric?: Metric | null;
  onClose: () => void;
  onSave: (data: MetricFormData) => void;
  onDelete?: (metric: Metric) => void;
}

const METRIC_TYPES: MetricType[] = ['Financial', 'Operational', 'Custom'];
const CALC_METHODS: CalculationMethod[] = ['Sum', 'Average', 'Formula', 'Manual'];
const FORMATS: MetricFormat[] = ['Currency', 'Percentage', 'Number'];
const DATA_SOURCES: DataSource[] = ['CRM', 'Manual', 'Calculated'];
const SEGMENTS = ['All', 'Mid Market', 'Enterprise', 'Majors'] as const;

export function MetricFormDrawer({ mode, metric, onClose, onSave, onDelete }: MetricFormDrawerProps) {
  const initData = (): MetricFormData => {
    const defaults = getDefaultMetric();
    if (mode === 'edit' && metric) {
      const { id, createdAt, ...rest } = metric;
      return { ...defaults, ...rest };
    }
    if (mode === 'duplicate' && metric) {
      const { id, createdAt, ...rest } = metric;
      return { ...defaults, ...rest, name: `${metric.name} (Copy)` };
    }
    return defaults;
  };

  const [form, setForm] = useState<MetricFormData>(initData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof MetricFormData>(key: K, value: MetricFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Metric name is required';
    if (!form.type) errs.type = 'Type is required';
    if (form.calculationMethod === 'Formula' && !form.formula.trim()) errs.formula = 'Formula is required when calculation method is Formula';
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
      await new Promise(r => setTimeout(r, 400));
      onSave(form);
    } catch {
      toast.error('Failed to save metric. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const title = mode === 'add' ? 'Add Metric' : mode === 'edit' ? 'Edit Metric' : 'Duplicate Metric';
  const subtitle = mode === 'add'
    ? 'Define a new metric for reporting and deal analysis'
    : mode === 'edit'
      ? 'Update metric configuration'
      : 'Create a copy with new settings';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-5 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight">{title}</h2>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
              <X className="w-3.5 h-3.5 text-[#999891]" />
            </button>
          </div>
          <p className="text-[11px] text-[#999891] mt-0.5">{subtitle}</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* ── SECTION: Details ──────────────────────── */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                    Metric Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full h-7 px-2 border border-[#e2e0d8] rounded text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    placeholder="e.g. Net New ARR"
                  />
                  {errors.name && <p className="text-[10px] text-red-600 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="What does this metric measure?"
                    rows={2}
                    className="w-full px-2 py-1 border border-[#e2e0d8] rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[28px] transition-colors placeholder:text-[#999891]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-1">
                      {METRIC_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set('type', t)}
                          className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all ${
                            form.type === t
                              ? 'bg-[#1a1a1a] text-white shadow-sm'
                              : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.type && <p className="text-[10px] text-red-600 mt-0.5">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Status</label>
                    <div className="flex gap-1">
                      {(['Active', 'Inactive'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set('status', s)}
                          className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all inline-flex items-center gap-1 ${
                            form.status === s
                              ? s === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                              : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${
                            form.status === s
                              ? s === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                              : 'bg-[#999891]'
                          }`} />
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Segment</label>
                  <select
                    value={form.segment}
                    onChange={(e) => set('segment', e.target.value as MetricFormData['segment'])}
                    className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                  >
                    {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Show in Deal Type Summaries</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEAL_TYPES.map(dt => {
                      const selected = form.dealTypes.includes(dt);
                      return (
                        <button
                          key={dt}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? form.dealTypes.filter(d => d !== dt)
                              : [...form.dealTypes, dt];
                            set('dealTypes', next);
                          }}
                          className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all inline-flex items-center gap-1.5 ${
                            selected
                              ? 'bg-[#1a1a1a] text-white shadow-sm'
                              : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                          }`}
                        >
                          {selected && (
                            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                          {dt}
                        </button>
                      );
                    })}
                  </div>
                  {form.dealTypes.length === 0 && (
                    <p className="text-[10px] text-[#999891] mt-1">No deal types selected — metric won't appear in any deal summary</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* ── SECTION: Calculation ────────────────────── */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">Calculation</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Calculation Method</label>
                    <select
                      value={form.calculationMethod}
                      onChange={(e) => set('calculationMethod', e.target.value as CalculationMethod)}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {CALC_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Format</label>
                    <select
                      value={form.format}
                      onChange={(e) => set('format', e.target.value as MetricFormat)}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Data Source</label>
                  <select
                    value={form.dataSource}
                    onChange={(e) => set('dataSource', e.target.value as DataSource)}
                    className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                  >
                    {DATA_SOURCES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {form.calculationMethod === 'Formula' && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                      Formula <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.formula}
                      onChange={(e) => set('formula', e.target.value)}
                      placeholder="e.g. New ARR + Expansion ARR − Churned ARR"
                      rows={2}
                      className="w-full px-2 py-1 border border-[#e2e0d8] rounded text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[28px] transition-colors placeholder:text-[#999891]"
                    />
                    {errors.formula && <p className="text-[10px] text-red-600 mt-0.5">{errors.formula}</p>}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-[#e2e0d8]" />

            {/* ── SECTION: Advanced ───────────────────────── */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 transition-colors w-full py-0.5"
              >
                {showAdvanced ? <ChevronDown className="w-3 h-3 text-[#999891]" /> : <ChevronRight className="w-3 h-3 text-[#999891]" />}
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Advanced Settings</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Display Order</label>
                      <input
                        type="number" min="0" value={form.displayOrder}
                        onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                        className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Precision</label>
                      <input
                        type="number" min="0" max="6" value={form.precision}
                        onChange={(e) => set('precision', parseInt(e.target.value) || 2)}
                        className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-5 py-2.5 flex items-center justify-end gap-2">
          {mode === 'edit' ? (
            <>
              <button
                onClick={() => { if (metric && onDelete) onDelete(metric); }}
                className="h-7 px-2.5 text-[#333333] text-[11px] font-medium transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
              >
                Delete
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 px-3 bg-[#1a1a1a] text-white rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              >
                {isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-7 px-2.5 border border-[#e2e0d8] rounded hover:bg-[#f9fafb] text-[#333333] text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 px-3 bg-[#1a1a1a] text-white rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              >
                {isSaving ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="w-3 h-3" /> {mode === 'add' ? 'Save' : 'Save Copy'}</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
